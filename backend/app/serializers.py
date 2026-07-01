from datetime import date, datetime, timezone

from app import scheduling
from app.models import Plant, WateringEvent
from app.schemas import PlantOut, SpeciesOut, UserOut


def utc_today() -> date:
    return datetime.now(timezone.utc).date()


def latest_watering(plant: Plant) -> WateringEvent | None:
    if not plant.waterings:
        return None
    return max(plant.waterings, key=lambda w: w.watered_at)


def plant_to_out(plant: Plant, today: date | None = None) -> PlantOut:
    today = today or utc_today()
    last = latest_watering(plant)
    last_date = last.watered_at.date() if last else None
    next_due = scheduling.next_due_date(last_date, plant.water_interval_days, today)
    return PlantOut(
        id=plant.id,
        name=plant.name,
        species=SpeciesOut.model_validate(plant.species) if plant.species else None,
        water_interval_days=plant.water_interval_days,
        notes=plant.notes,
        created_at=plant.created_at,
        last_watered_at=last.watered_at if last else None,
        last_watered_by=last.user.display_name if last else None,
        next_due=next_due,
        status=scheduling.watering_status(next_due, today),
    )
