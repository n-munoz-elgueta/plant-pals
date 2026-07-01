from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_membership
from app.database import get_db
from app.models import HouseholdMember, Plant, Species
from app.schemas import PlantCreate, PlantOut, PlantUpdate
from app.serializers import plant_to_out, utc_today

router = APIRouter(prefix="/plants", tags=["plants"])


def get_household_plant(
    plant_id: int,
    membership: HouseholdMember = Depends(get_current_membership),
    db: Session = Depends(get_db),
) -> Plant:
    plant = db.get(Plant, plant_id)
    if plant is None or plant.household_id != membership.household_id:
        raise HTTPException(404, "Plant not found")
    return plant


def validate_species(species_id: int | None, db: Session) -> None:
    if species_id is not None and db.get(Species, species_id) is None:
        raise HTTPException(400, "Unknown species")


@router.get("", response_model=list[PlantOut])
def list_plants(
    membership: HouseholdMember = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    plants = (
        db.query(Plant)
        .filter(Plant.household_id == membership.household_id)
        .order_by(Plant.name)
        .all()
    )
    today = utc_today()
    return [plant_to_out(p, today) for p in plants]


@router.post("", response_model=PlantOut, status_code=201)
def create_plant(
    body: PlantCreate,
    membership: HouseholdMember = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    validate_species(body.species_id, db)
    plant = Plant(
        household_id=membership.household_id,
        name=body.name,
        species_id=body.species_id,
        water_interval_days=body.water_interval_days,
        notes=body.notes,
    )
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant_to_out(plant)


@router.get("/{plant_id}", response_model=PlantOut)
def get_plant(plant: Plant = Depends(get_household_plant)):
    return plant_to_out(plant)


@router.patch("/{plant_id}", response_model=PlantOut)
def update_plant(
    body: PlantUpdate,
    plant: Plant = Depends(get_household_plant),
    db: Session = Depends(get_db),
):
    updates = body.model_dump(exclude_unset=True)
    if "species_id" in updates:
        validate_species(updates["species_id"], db)
    for field, value in updates.items():
        setattr(plant, field, value)
    db.commit()
    db.refresh(plant)
    return plant_to_out(plant)


@router.delete("/{plant_id}", status_code=204)
def delete_plant(
    plant: Plant = Depends(get_household_plant),
    db: Session = Depends(get_db),
):
    db.delete(plant)
    db.commit()
