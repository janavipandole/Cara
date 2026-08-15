"""Regression tests for GET /api/receipts/{id}/receipt authorization (issue #7842).

The endpoint must not expose customer PII (full_name, email, total) to
unauthenticated callers or to authenticated users who do not own the order.
"""
from passlib.context import CryptContext

from app.models import Order, OrderItem, User
from tests.conftest import TestingSessionLocal

RECEIPTS_URL = "/api/receipts/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client, *, username, email):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=username,
            email=email,
            hashed_password=pwd.hash("Test@1234"),
        )
        db.add(user)
        db.commit()
    db.close()

    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_order(*, email: str, full_name: str = "Receipt Owner") -> int:
    db = TestingSessionLocal()
    order = Order(
        full_name=full_name,
        email=email,
        address="1 Receipt St",
        city="Receipt City",
        zip_code="55555",
        total_amount=240.0,
        status="CONFIRMED",
    )
    db.add(order)
    db.flush()
    db.add(
        OrderItem(
            order_id=order.id,
            product_id=7,
            product_name="Receipt Shirt",
            quantity=2,
            price=120.0,
        )
    )
    db.commit()
    db.refresh(order)
    order_id = order.id
    db.close()
    return order_id


def test_receipt_requires_auth(client):
    order_id = _seed_order(email="victim@example.com", full_name="Victim Name")
    response = client.get(f"{RECEIPTS_URL}{order_id}/receipt")
    assert response.status_code == 401, response.text


def test_receipt_forbidden_for_non_owner(client):
    _auth_headers(client, username="rcpt_owner", email="rcpt_owner@example.com")
    order_id = _seed_order(email="rcpt_owner@example.com", full_name="Owner Name")

    other_headers = _auth_headers(
        client, username="rcpt_other", email="rcpt_other@example.com"
    )
    response = client.get(f"{RECEIPTS_URL}{order_id}/receipt", headers=other_headers)
    assert response.status_code == 403, response.text


def test_receipt_returns_payload_for_owner(client):
    headers = _auth_headers(client, username="rcpt_owner2", email="rcpt_owner2@example.com")
    order_id = _seed_order(email="rcpt_owner2@example.com", full_name="Owner Two")

    response = client.get(f"{RECEIPTS_URL}{order_id}/receipt", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["order_id"] == order_id
    assert data["email"] == "rcpt_owner2@example.com"
    assert data["full_name"] == "Owner Two"
    assert "signature" in data
    assert len(data["items"]) == 1
