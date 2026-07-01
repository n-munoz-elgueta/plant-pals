from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import scheduling
from app.auth import get_current_membership
from app.database import get_db
from app.models import HouseholdMember, Plant
from app.schemas import SchedulePlant, ScheduleResponse
from app.serializers import latest_watering, utc_today

router = APIRouter(prefix="/schedule", tags=["schedule"])

MAX_RANGE_DAYS = 366


@router.get("", response_model=ScheduleResponse)
def get_schedule(
    start: date | None = None,
    end: date | None = None,
    membership: HouseholdMember = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    today = utc_today()
    start = start or today
    end = end or start + timedelta(days=13)
    if end < start:
        raise HTTPException(400, "end must not be before start")
    if (end - start).days > MAX_RANGE_DAYS:
        raise HTTPException(400, f"Range must be at most {MAX_RANGE_DAYS} days")

    plants = (
        db.query(Plant)
        .filter(Plant.household_id == membership.household_id)
        .order_by(Plant.name)
        .all()
    )
    entries = []
    for plant in plants:
        last = latest_watering(plant)
        last_date = last.watered_at.date() if last else None
        next_due = scheduling.next_due_date(last_date, plant.water_interval_days, today)
        entries.append(
            SchedulePlant(
                plant_id=plant.id,
                name=plant.name,
                status=scheduling.watering_status(next_due, today),
                next_due=next_due,
                due_dates=scheduling.due_dates_in_range(
                    last_date, plant.water_interval_days, today, start, end
                ),
            )
        )
    return ScheduleResponse(start=start, end=end, plants=entries)
