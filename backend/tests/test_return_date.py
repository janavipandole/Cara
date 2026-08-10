"""Estimated Return Date policy engine tests.

Covers the delivered_at capture + immutable return deadline
(delivered_at + 30 days) surfaced on the order API.
"""
from datetime import datetime, timezone

from passlib.context import CryptContext

from app.models import Order, Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

USER_EMAIL = "return@example.com"
ADMIN_EMAIL = "returnadmin@example.com"


def _ensure_user(email, username, *, role="USER"):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=username,
            email=email,
            hashed_password=pwd.hash("Test@1234"),
            role=role,
        )
        db.add(user)
        db.commit()
    db.close()


def _auth_headers(client, *, email=USER_EMAIL, username="returnuser"):
    _ensure_user(email, username)
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _admin_headers(client):
    _ensure_user(ADMIN_EMAIL, "returnadmin", role="ADMIN")
    response = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_product(name="Return Tee", stock=20):
    db = TestingSessionLocal()
    product = Product(
        brand="Cara",
        name=name,
        price=1000.0,
        img="tee.jpg",
        rating=4,
        category="minimal",
        stock=stock,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    product_id = product.id
    db.close()
    return product_id


def _create_order(client, headers):
    product_id = _seed_product()
    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Return User",
            "email": USER_EMAIL,
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_id": product_id, "quantity": 1}],
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["order_id"]


def test_mark_delivered_captures_timestamp_and_deadline(client):
    headers = _auth_headers(client)
    order_id = _create_order(client, headers)

    shipped = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "SHIPPED"},
    )
    assert shipped.status_code == 200, shipped.text
    assert shipped.json()["delivered_at"] is None
    assert shipped.json()["return_deadline"] is None

    delivered = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "DELIVERED"},
    )
    assert delivered.status_code == 200, delivered.text
    delivered_at = delivered.json()["delivered_at"]
    assert delivered_at is not None
    assert delivered.json()["return_deadline"] is not None

    db = TestingSessionLocal()
    order = db.query(Order).filter(Order.id == order_id).one()
    assert order.status == "DELIVERED"
    assert order.delivered_at is not None
    db.close()


def test_delivering_twice_keeps_original_timestamp(client):
    headers = _auth_headers(client)
    order_id = _create_order(client, headers)

    first = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "DELIVERED"},
    )
    second = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "DELIVERED"},
    )
    assert first.json()["delivered_at"] == second.json()["delivered_at"]


def test_non_admin_cannot_update_status(client):
    headers = _auth_headers(client)
    order_id = _create_order(client, headers)
    response = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=headers,
        json={"status": "DELIVERED"},
    )
    assert response.status_code == 403, response.text


def _as_utc(value):
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def test_order_response_exposes_return_deadline(client):
    headers = _auth_headers(client)
    order_id = _create_order(client, headers)

    # Not yet delivered: no deadline surfaced.
    detail = client.get(f"{ORDERS_URL}{order_id}", headers=headers)
    assert detail.status_code == 200, detail.text
    assert detail.json()["delivered_at"] is None
    assert detail.json()["return_deadline"] is None

    client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "DELIVERED"},
    )

    detail = client.get(f"{ORDERS_URL}{order_id}", headers=headers)
    assert detail.status_code == 200, detail.text
    assert detail.json()["delivered_at"] is not None
    assert detail.json()["return_deadline"] is not None

    delivered_at = _as_utc(detail.json()["delivered_at"])
    deadline = _as_utc(detail.json()["return_deadline"])
    assert (deadline - delivered_at).days == 30


def test_invalid_status_rejected(client):
    headers = _auth_headers(client)
    order_id = _create_order(client, headers)
    response = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "IN_TRANSIT"},
    )
    assert response.status_code == 422, response.text
