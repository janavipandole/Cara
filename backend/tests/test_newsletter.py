def test_subscribe_success(client):
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "newuser@example.com"},
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Subscription request processed"


def test_subscribe_duplicate(client):
    client.post(
        "/api/newsletter/subscribe",
        json={"email": "dup@example.com"},
    )
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "dup@example.com"},
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Subscription request processed"


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
    # Fetch the token the subscribe flow generated from the test DB.
    from app.models import NewsletterSubscriber
    from tests.conftest import TestingSessionLocal

    db = TestingSessionLocal()
    subscriber = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.email == "unsub@example.com")
        .first()
    )
    token = subscriber.unsubscribe_token
    db.close()

    response = client.post(
        "/api/newsletter/unsubscribe",
        json={"token": token},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully unsubscribed"


def test_unsubscribe_invalid_token(client):
    response = client.post(
        "/api/newsletter/unsubscribe",
        json={"token": "does-not-exist"},
    )
    assert response.status_code == 400


def test_reactivate_after_unsubscribe(client):
    from app.models import NewsletterSubscriber
    from tests.conftest import TestingSessionLocal

    client.post(
        "/api/newsletter/subscribe",
        json={"email": "reactivate@example.com"},
    )
    db = TestingSessionLocal()
    subscriber = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.email == "reactivate@example.com")
        .first()
    )
    token = subscriber.unsubscribe_token
    db.close()

    client.post(
        "/api/newsletter/unsubscribe",
        json={"token": token},
    )
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "reactivate@example.com"},
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Subscription request processed"
