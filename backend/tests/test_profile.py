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


def _auth_headers_for(client, email):
    """Create a fresh, uniquely-named user and return login headers.

    The shared `auth_headers` fixture always inserts username "testuser", which
    collides across tests within a file run; these validation tests use a
    unique user per call so each runs standalone.
    """
    from passlib.context import CryptContext
    from sqlalchemy.orm import Session

    from app.models import User
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    if db.query(User).filter(User.email == email).first() is None:
        db.add(
            User(
                username=email.split("@")[0] + "_u",
                email=email,
                hashed_password=CryptContext(schemes=["bcrypt"], deprecated="auto").hash("Test@1234"),
            )
        )
        db.commit()
    db.close()

    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Test@1234"},
    )
    assert login.status_code == 200, login.text
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_update_profile_avatar_https_accepted(client):
    headers = _auth_headers_for(client, "avatar-https@example.com")
    response = client.put(
        "/api/profile/",
        json={"avatar_url": "https://example.com/avatar.png"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["avatar_url"] == "https://example.com/avatar.png"


def test_update_profile_avatar_relative_path_accepted(client):
    headers = _auth_headers_for(client, "avatar-relative@example.com")
    response = client.put(
        "/api/profile/",
        json={"avatar_url": "/uploads/avatar.png"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["avatar_url"] == "/uploads/avatar.png"


def test_update_profile_avatar_javascript_scheme_rejected(client):
    headers = _auth_headers_for(client, "avatar-js@example.com")
    response = client.put(
        "/api/profile/",
        json={"avatar_url": "javascript:alert(1)"},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_profile_avatar_data_scheme_rejected(client):
    headers = _auth_headers_for(client, "avatar-data@example.com")
    response = client.put(
        "/api/profile/",
        json={"avatar_url": "data:text/html,<script>alert(1)</script>"},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_profile_avatar_file_scheme_rejected(client):
    headers = _auth_headers_for(client, "avatar-file@example.com")
    response = client.put(
        "/api/profile/",
        json={"avatar_url": "file:///etc/passwd"},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_profile_overlong_full_name_rejected(client):
    headers = _auth_headers_for(client, "profile-long-name@example.com")
    response = client.put(
        "/api/profile/",
        json={"full_name": "x" * 101},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_profile_overlong_avatar_url_rejected(client):
    headers = _auth_headers_for(client, "profile-long-avatar@example.com")
    response = client.put(
        "/api/profile/",
        json={"avatar_url": "https://example.com/" + "a" * 2048},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_profile_phone_with_bad_chars_rejected(client):
    headers = _auth_headers_for(client, "profile-bad-phone@example.com")
    response = client.put(
        "/api/profile/",
        json={"phone": "123; DROP TABLE users"},
        headers=headers,
    )
    assert response.status_code == 422


def test_update_profile_zip_with_bad_chars_rejected(client):
    headers = _auth_headers_for(client, "profile-bad-zip@example.com")
    response = client.put(
        "/api/profile/",
        json={"zip_code": "10001<script>"},
        headers=headers,
    )
    assert response.status_code == 422
