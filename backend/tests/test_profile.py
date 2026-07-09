def test_get_profile(client, auth_headers):
    response = client.get("/api/profile/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "username" in data


def test_update_profile_full_name(client, auth_headers):
    response = client.put(
        "/api/profile/",
        json={"full_name": "John Doe"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "John Doe"


def test_update_profile_phone(client, auth_headers):
    response = client.put(
        "/api/profile/",
        json={"phone": "+1-555-0100"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["phone"] == "+1-555-0100"


def test_update_profile_address(client, auth_headers):
    response = client.put(
        "/api/profile/",
        json={
            "address_line1": "123 Main St",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["address_line1"] == "123 Main St"
    assert data["city"] == "New York"
    assert data["zip_code"] == "10001"


def test_get_profile_after_update(client, auth_headers):
    client.put(
        "/api/profile/",
        json={"full_name": "Jane Doe", "phone": "+1-555-0200"},
        headers=auth_headers,
    )
    response = client.get("/api/profile/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["full_name"] == "Jane Doe"
    assert response.json()["phone"] == "+1-555-0200"
