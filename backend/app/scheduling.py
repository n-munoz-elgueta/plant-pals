"""Pure date math for watering schedules.

A plant's next due date is its latest watering plus its interval; a plant
that has never been watered is due immediately. Overdue plants surface on
"today" in calendar projections rather than on dates in the past.
"""

from datetime import date, timedelta

STATUS_OK = "ok"
STATUS_DUE_TODAY = "due_today"
STATUS_OVERDUE = "overdue"


def next_due_date(last_watered: date | None, interval_days: int, today: date) -> date:
    if last_watered is None:
        return today
    return last_watered + timedelta(days=interval_days)


def watering_status(next_due: date, today: date) -> str:
    if next_due < today:
        return STATUS_OVERDUE
    if next_due == today:
        return STATUS_DUE_TODAY
    return STATUS_OK


def due_dates_in_range(
    last_watered: date | None,
    interval_days: int,
    today: date,
    start: date,
    end: date,
) -> list[date]:
    """Project due dates into [start, end], assuming the plant gets watered
    on each due date going forward."""
    if interval_days < 1 or end < start:
        return []
    due = max(next_due_date(last_watered, interval_days, today), today)
    dates = []
    while due <= end:
        if due >= start:
            dates.append(due)
        due += timedelta(days=interval_days)
    return dates
