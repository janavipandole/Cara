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
    assert response.status_code == 400


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
