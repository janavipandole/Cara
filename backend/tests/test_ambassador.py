def test_ambassador_apply_success(client):
    response = client.post(
        "/api/ambassador/apply",
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "instagram_handle": "@janedoe",
            "follower_count": 5000,
            "motivation": "I love fashion!"
        },
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Application submitted successfully"


def test_ambassador_apply_negative_followers(client):
    response = client.post(
        "/api/ambassador/apply",
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "instagram_handle": "@janedoe",
            "follower_count": -10,
            "motivation": "Test"
        },
    )
    # follower_count is validated by Field(ge=0) at the schema boundary.
    assert response.status_code == 422


def test_ambassador_apply_oversized_motivation(client):
    response = client.post(
        "/api/ambassador/apply",
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "instagram_handle": "@janedoe",
            "follower_count": 5000,
            "motivation": "x" * 5000,
        },
    )
    assert response.status_code == 422


def test_ambassador_apply_oversized_full_name(client):
    response = client.post(
        "/api/ambassador/apply",
        json={
            "full_name": "x" * 500,
            "email": "jane@example.com",
            "instagram_handle": "@janedoe",
            "follower_count": 5000,
            "motivation": "Test"
        },
    )
    assert response.status_code == 422


def test_ambassador_apply_oversized_instagram_handle(client):
    response = client.post(
        "/api/ambassador/apply",
        json={
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "instagram_handle": "@" + "x" * 500,
            "follower_count": 5000,
            "motivation": "Test"
        },
    )
    assert response.status_code == 422


def test_ambassador_apply_invalid_email(client):
    response = client.post(
        "/api/ambassador/apply",
        json={
            "full_name": "Jane Doe",
            "email": "invalid-email",
            "instagram_handle": "@janedoe",
            "follower_count": 5000,
            "motivation": "Test"
        },
    )
    assert response.status_code == 422
