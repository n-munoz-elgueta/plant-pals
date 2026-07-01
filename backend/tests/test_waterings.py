from datetime import datetime, timedelta, timezone

from app.serializers import utc_today
from tests.test_plants import create_plant


def test_record_watering_updates_status(client, household_user):
    plant = create_plant(client, household_user, interval=7)
    res = client.post(f"/plants/{plant['id']}/waterings", json={}, headers=household_user)
    assert res.status_code == 201
    assert res.json()["user"]["display_name"] == "Ash"

    refreshed = client.get(f"/plants/{plant['id']}", headers=household_user).json()
    assert refreshed["status"] == "ok"
    assert refreshed["last_watered_by"] == "Ash"
    expected_due = utc_today() + timedelta(days=7)
    assert refreshed["next_due"] == expected_due.isoformat()


def test_both_partners_show_in_history(client, make_user, household_user):
    code = client.get("/households/me", headers=household_user).json()["invite_code"]
    partner = make_user(email="partner@example.com", name="Robin")
    client.post("/households/join", json={"invite_code": code}, headers=partner)

    plant = create_plant(client, household_user, interval=5)
    past = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
    client.post(
        f"/plants/{plant['id']}/waterings",
        json={"watered_at": past},
        headers=household_user,
    )
    client.post(f"/plants/{plant['id']}/waterings", json={"note": "soaked it"}, headers=partner)

    history = client.get(f"/plants/{plant['id']}/waterings", headers=household_user).json()
    assert [w["user"]["display_name"] for w in history] == ["Robin", "Ash"]
    assert history[0]["note"] == "soaked it"


def test_rejects_future_watering(client, household_user):
    plant = create_plant(client, household_user)
    future = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    res = client.post(
        f"/plants/{plant['id']}/waterings",
        json={"watered_at": future},
        headers=household_user,
    )
    assert res.status_code == 400


def test_delete_watering(client, household_user):
    plant = create_plant(client, household_user)
    event = client.post(
        f"/plants/{plant['id']}/waterings", json={}, headers=household_user
    ).json()
    res = client.delete(
        f"/plants/{plant['id']}/waterings/{event['id']}", headers=household_user
    )
    assert res.status_code == 204
    assert client.get(f"/plants/{plant['id']}/waterings", headers=household_user).json() == []


def test_schedule_endpoint(client, household_user):
    overdue = create_plant(client, household_user, name="Fernie", interval=3)
    past = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    client.post(
        f"/plants/{overdue['id']}/waterings", json={"watered_at": past}, headers=household_user
    )
    fresh = create_plant(client, household_user, name="Monty", interval=7)
    client.post(f"/plants/{fresh['id']}/waterings", json={}, headers=household_user)

    res = client.get("/schedule", headers=household_user)
    assert res.status_code == 200
    body = res.json()
    by_name = {p["name"]: p for p in body["plants"]}

    today = utc_today()
    assert by_name["Fernie"]["status"] == "overdue"
    # overdue plants surface on today, then project forward every 3 days
    assert by_name["Fernie"]["due_dates"][0] == today.isoformat()
    assert by_name["Fernie"]["due_dates"][1] == (today + timedelta(days=3)).isoformat()

    assert by_name["Monty"]["status"] == "ok"
    assert by_name["Monty"]["due_dates"] == [(today + timedelta(days=7)).isoformat()]

    bad = client.get(
        "/schedule",
        params={"start": "2026-07-10", "end": "2026-07-01"},
        headers=household_user,
    )
    assert bad.status_code == 400
