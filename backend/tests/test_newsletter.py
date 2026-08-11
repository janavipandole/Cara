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
    from app.models import NewsletterSubscriber
    from tests.conftest import TestingSessionLocal

    client.post(
        "/api/newsletter/subscribe",
        json={"email": "resub@example.com"},
    )

    def _token_for(email):
        db = TestingSessionLocal()
        sub = (
            db.query(NewsletterSubscriber)
            .filter(NewsletterSubscriber.email == email)
            .first()
        )
        token = sub.unsubscribe_token
        db.close()
        return token

    first_token = _token_for("resub@example.com")
    assert first_token

    # Unsubscribe, then resubscribe.
    client.post(
        "/api/newsletter/unsubscribe",
        json={"token": first_token},
    )
    resub = client.post(
        "/api/newsletter/subscribe",
        json={"email": "resub@example.com"},
    )
    assert resub.status_code == 201

    # The subscriber is active again and still has a valid token.
    second_token = _token_for("resub@example.com")
    assert second_token
    db = TestingSessionLocal()
    sub = (
        db.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.email == "resub@example.com")
        .first()
    )
    assert sub.is_active is True
    db.close()

    # The (reused) token can unsubscribe again.
    unsub = client.post(
        "/api/newsletter/unsubscribe",
        json={"token": second_token},
    )
    assert unsub.status_code == 200
