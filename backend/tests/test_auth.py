def test_register_and_me(client):
    res = client.post(
        "/auth/register",
        json={"email": "a@example.com", "password": "password123", "display_name": "A"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["user"]["email"] == "a@example.com"

    headers = {"Authorization": f"Bearer {body['access_token']}"}
    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["display_name"] == "A"


def test_register_duplicate_email(client, make_user):
    make_user(email="dup@example.com")
    res = client.post(
        "/auth/register",
        json={"email": "DUP@example.com", "password": "password123", "display_name": "B"},
    )
    assert res.status_code == 400


def test_login(client, make_user):
    make_user(email="log@example.com", password="password123")
    ok = client.post(
        "/auth/login", json={"email": "log@example.com", "password": "password123"}
    )
    assert ok.status_code == 200
    assert ok.json()["access_token"]

    bad = client.post(
        "/auth/login", json={"email": "log@example.com", "password": "wrongpassword"}
    )
    assert bad.status_code == 401


def test_requires_token(client):
    assert client.get("/auth/me").status_code == 401
    assert client.get("/plants").status_code == 401
