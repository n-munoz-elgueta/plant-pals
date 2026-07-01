import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import config
from app.auth import get_current_membership
from app.database import get_db
from app.models import HouseholdMember, Plant, Species
from app.schemas import PlantCreate, PlantOut, PlantUpdate
from app.serializers import plant_to_out, utc_today

router = APIRouter(prefix="/plants", tags=["plants"])

ALLOWED_PHOTO_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
}
MAX_PHOTO_BYTES = 10 * 1024 * 1024


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
    if plant.photo_filename:
        (config.MEDIA_DIR / plant.photo_filename).unlink(missing_ok=True)
    db.delete(plant)
    db.commit()


@router.post("/{plant_id}/photo", response_model=PlantOut)
async def upload_photo(
    file: UploadFile,
    plant: Plant = Depends(get_household_plant),
    db: Session = Depends(get_db),
):
    ext = ALLOWED_PHOTO_TYPES.get(file.content_type or "")
    if ext is None:
        raise HTTPException(400, "Photo must be a JPEG, PNG, WebP, or HEIC image")
    data = await file.read()
    if len(data) > MAX_PHOTO_BYTES:
        raise HTTPException(400, "Photo must be smaller than 10 MB")

    config.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"plant_{plant.id}_{secrets.token_hex(8)}{ext}"
    (config.MEDIA_DIR / filename).write_bytes(data)

    if plant.photo_filename:
        (config.MEDIA_DIR / plant.photo_filename).unlink(missing_ok=True)
    plant.photo_filename = filename
    db.commit()
    db.refresh(plant)
    return plant_to_out(plant)
