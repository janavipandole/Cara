"""Tests for POST /api/contact/."""
from app.models import ContactMessage
from tests.conftest import TestingSessionLocal

CONTACT_URL = "/api/contact/"

VALID_PAYLOAD = {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Order question",
    "department": "orders",
    "message": "Hello, I need help with my recent order please.",
}


def test_contact_submit_success(client):
    response = client.post(CONTACT_URL, json=VALID_PAYLOAD)
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["message"] == "Contact message submitted successfully"
    assert "id" in body

    db = TestingSessionLocal()
    saved = db.query(ContactMessage).filter(ContactMessage.id == body["id"]).first()
    assert saved is not None
    assert saved.email == "jane@example.com"
    assert saved.department == "orders"
    db.close()


def test_contact_rejects_short_message(client):
    response = client.post(
        CONTACT_URL,
        json={**VALID_PAYLOAD, "message": "too short"},
    )
    assert response.status_code == 422


def test_contact_rejects_invalid_email(client):
    response = client.post(
        CONTACT_URL,
        json={**VALID_PAYLOAD, "email": "not-an-email"},
    )
    assert response.status_code == 422
