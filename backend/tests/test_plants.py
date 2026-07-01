def create_plant(client, headers, name="Monty", interval=7, **extra):
    res = client.post(
        "/plants",
        json={"name": name, "water_interval_days": interval, **extra},
        headers=headers,
    )
    assert res.status_code == 201, res.text
    return res.json()


def test_plant_crud(client, household_user):
    plant = create_plant(client, household_user, name="Monty", interval=7)
    assert plant["status"] == "due_today"  # never watered -> due immediately
    assert plant["last_watered_at"] is None

    res = client.patch(
        f"/plants/{plant['id']}", json={"water_interval_days": 10}, headers=household_user
    )
    assert res.status_code == 200
    assert res.json()["water_interval_days"] == 10

    assert client.get("/plants", headers=household_user).json()[0]["name"] == "Monty"
    assert client.delete(f"/plants/{plant['id']}", headers=household_user).status_code == 204
    assert client.get("/plants", headers=household_user).json() == []


def test_species_prefill_data(client, household_user):
    species = client.get("/species", headers=household_user).json()
    assert len(species) == 50
    monstera = next(s for s in species if s["common_name"] == "Monstera")
    plant = create_plant(
        client,
        household_user,
        species_id=monstera["id"],
        interval=monstera["suggested_interval_days"],
    )
    assert plant["species"]["scientific_name"] == "Monstera deliciosa"

    res = client.post(
        "/plants",
        json={"name": "Bad", "water_interval_days": 7, "species_id": 99999},
        headers=household_user,
    )
    assert res.status_code == 400


def test_plants_scoped_to_household(client, make_user, household_user):
    plant = create_plant(client, household_user)

    outsider = make_user(email="outsider@example.com")
    client.post("/households", json={"name": "Other"}, headers=outsider)
    assert client.get("/plants", headers=outsider).json() == []
    assert client.get(f"/plants/{plant['id']}", headers=outsider).status_code == 404
    assert (
        client.delete(f"/plants/{plant['id']}", headers=outsider).status_code == 404
    )
