from datetime import date

from app import scheduling

TODAY = date(2026, 7, 1)


def test_never_watered_is_due_today():
    due = scheduling.next_due_date(None, 7, TODAY)
    assert due == TODAY
    assert scheduling.watering_status(due, TODAY) == "due_today"


def test_watered_today_is_ok():
    due = scheduling.next_due_date(TODAY, 7, TODAY)
    assert due == date(2026, 7, 8)
    assert scheduling.watering_status(due, TODAY) == "ok"


def test_overdue():
    due = scheduling.next_due_date(date(2026, 6, 20), 7, TODAY)
    assert due == date(2026, 6, 27)
    assert scheduling.watering_status(due, TODAY) == "overdue"


def test_due_exactly_today():
    due = scheduling.next_due_date(date(2026, 6, 24), 7, TODAY)
    assert scheduling.watering_status(due, TODAY) == "due_today"


def test_projection_repeats_at_interval():
    dates = scheduling.due_dates_in_range(
        TODAY, 5, TODAY, start=TODAY, end=date(2026, 7, 20)
    )
    assert dates == [date(2026, 7, 6), date(2026, 7, 11), date(2026, 7, 16)]


def test_projection_overdue_starts_today():
    dates = scheduling.due_dates_in_range(
        date(2026, 6, 1), 7, TODAY, start=TODAY, end=date(2026, 7, 15)
    )
    assert dates == [TODAY, date(2026, 7, 8), date(2026, 7, 15)]


def test_projection_respects_start_of_range():
    dates = scheduling.due_dates_in_range(
        TODAY, 3, TODAY, start=date(2026, 7, 8), end=date(2026, 7, 12)
    )
    assert dates == [date(2026, 7, 10)]


def test_projection_empty_cases():
    assert scheduling.due_dates_in_range(TODAY, 0, TODAY, TODAY, TODAY) == []
    assert scheduling.due_dates_in_range(TODAY, 7, TODAY, date(2026, 7, 10), date(2026, 7, 5)) == []
    assert scheduling.due_dates_in_range(TODAY, 30, TODAY, TODAY, date(2026, 7, 10)) == []
