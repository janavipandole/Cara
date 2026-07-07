def test_subscribe_success(client):
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "newuser@example.com"},
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Successfully subscribed to newsletter"


def test_subscribe_duplicate(client):
    client.post(
        "/api/newsletter/subscribe",
        json={"email": "dup@example.com"},
    )
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "dup@example.com"},
    )
    assert response.status_code == 409
    assert "already subscribed" in response.json()["detail"]


def test_subscribe_invalid_email(client):
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "not-an-email"},
    )
    assert response.status_code == 422


def test_unsubscribe_success(client):
    client.post(
        "/api/newsletter/subscribe",
        json={"email": "unsub@example.com"},
    )
    response = client.post(
        "/api/newsletter/unsubscribe",
        json={"email": "unsub@example.com"},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully unsubscribed"


def test_unsubscribe_not_found(client):
    response = client.post(
        "/api/newsletter/unsubscribe",
        json={"email": "never-subscribed@example.com"},
    )
    assert response.status_code == 404


def test_reactivate_after_unsubscribe(client):
    client.post(
        "/api/newsletter/subscribe",
        json={"email": "reactivate@example.com"},
    )
    client.post(
        "/api/newsletter/unsubscribe",
        json={"email": "reactivate@example.com"},
    )
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "reactivate@example.com"},
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Subscription reactivated"
