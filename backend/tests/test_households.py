def test_create_and_join_household(client, make_user):
    creator = make_user(email="one@example.com", name="One")
    res = client.post("/households", json={"name": "Jungle"}, headers=creator)
    assert res.status_code == 201
    code = res.json()["invite_code"]
    assert len(code) == 6

    partner = make_user(email="two@example.com", name="Two")
    joined = client.post(
        "/households/join", json={"invite_code": code.lower()}, headers=partner
    )
    assert joined.status_code == 200
    members = {m["display_name"] for m in joined.json()["members"]}
    assert members == {"One", "Two"}

    mine = client.get("/households/me", headers=creator)
    assert mine.status_code == 200
    assert len(mine.json()["members"]) == 2


def test_join_with_bad_code(client, make_user):
    headers = make_user()
    res = client.post("/households/join", json={"invite_code": "NOPE99"}, headers=headers)
    assert res.status_code == 404


def test_cannot_join_twice(client, make_user, household_user):
    other = make_user(email="other@example.com")
    code = client.get("/households/me", headers=household_user).json()["invite_code"]
    assert (
        client.post("/households/join", json={"invite_code": code}, headers=other).status_code
        == 200
    )
    assert (
        client.post("/households", json={"name": "Second"}, headers=other).status_code == 400
    )
    assert (
        client.post("/households/join", json={"invite_code": code}, headers=other).status_code
        == 400
    )


def test_no_household_yet(client, make_user):
    headers = make_user()
    assert client.get("/households/me", headers=headers).status_code == 404
    assert client.get("/plants", headers=headers).status_code == 403
