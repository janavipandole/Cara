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


def test_unsubscribe_success(client, db_session):
    from app.models import NewsletterSubscriber
    from app.api.auth import token_digest

    raw_token = "unsubscribe-raw-token-value"
    subscriber = NewsletterSubscriber(
        email="unsub@example.com",
        unsubscribe_token=token_digest(raw_token),
    )
    db_session.add(subscriber)
    db_session.commit()

    response = client.post(
        "/api/newsletter/unsubscribe",
        json={"token": raw_token},
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully unsubscribed"


def test_unsubscribe_stores_only_token_digest(client, db_session):
    from app.models import NewsletterSubscriber
    from app.api.auth import token_digest

    raw_token = "digest-check-token"
    subscriber = NewsletterSubscriber(
        email="digest@example.com",
        unsubscribe_token=token_digest(raw_token),
    )
    db_session.add(subscriber)
    db_session.commit()

    stored = (
        db_session.query(NewsletterSubscriber)
        .filter(NewsletterSubscriber.email == "digest@example.com")
        .first()
    )
    assert stored.unsubscribe_token != raw_token
    assert stored.unsubscribe_token == token_digest(raw_token)


def test_unsubscribe_not_found(client):
    response = client.post(
        "/api/newsletter/unsubscribe",
        json={"token": "never-issued-token"},
    )
    assert response.status_code == 400
    assert "Invalid or expired unsubscribe link" in response.json()["detail"]


def test_reactivate_after_unsubscribe(client):
    client.post(
        "/api/newsletter/subscribe",
        json={"email": "reactivate@example.com"},
    )
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "reactivate@example.com"},
    )
    assert response.status_code == 201
    assert response.json()["message"] == "Subscription request processed"
