from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_membership, get_current_user
from app.database import get_db
from app.models import Plant, User, WateringEvent
from app.routers.plants import get_household_plant
from app.schemas import WateringCreate, WateringOut

router = APIRouter(prefix="/plants/{plant_id}/waterings", tags=["waterings"])


def normalize_utc(dt: datetime) -> datetime:
    """Store naive UTC datetimes so values compare consistently with defaults."""
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


@router.post("", response_model=WateringOut, status_code=201)
def record_watering(
    body: WateringCreate,
    plant: Plant = Depends(get_household_plant),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    watered_at = normalize_utc(body.watered_at or datetime.now(timezone.utc))
    if watered_at > datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(400, "Watering time cannot be in the future")
    event = WateringEvent(
        plant_id=plant.id, user_id=user.id, watered_at=watered_at, note=body.note
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("", response_model=list[WateringOut])
def list_waterings(
    plant: Plant = Depends(get_household_plant),
    db: Session = Depends(get_db),
):
    return (
        db.query(WateringEvent)
        .filter(WateringEvent.plant_id == plant.id)
        .order_by(WateringEvent.watered_at.desc())
        .all()
    )


@router.delete("/{watering_id}", status_code=204)
def delete_watering(
    watering_id: int,
    plant: Plant = Depends(get_household_plant),
    db: Session = Depends(get_db),
):
    event = db.get(WateringEvent, watering_id)
    if event is None or event.plant_id != plant.id:
        raise HTTPException(404, "Watering event not found")
    db.delete(event)
    db.commit()
