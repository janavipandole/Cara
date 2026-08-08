"""Estimated Return Date policy engine tests.

Covers the delivered_at capture + immutable return deadline
(delivered_at + 30 days) surfaced on the order API.
"""
from datetime import datetime, timezone

from app.models import Order, Product
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"


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
            "email": "test@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_id": product_id, "quantity": 1}],
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["order_id"]


def test_mark_delivered_captures_timestamp_and_deadline(client, auth_headers, admin_auth_headers):
    order_id = _create_order(client, auth_headers)

    shipped = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=admin_auth_headers,
        json={"status": "SHIPPED"},
    )
    assert shipped.status_code == 200, shipped.text
    assert shipped.json()["delivered_at"] is None
    assert shipped.json()["return_deadline"] is None

    delivered = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=admin_auth_headers,
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


def test_delivering_twice_keeps_original_timestamp(client, auth_headers, admin_auth_headers):
    order_id = _create_order(client, auth_headers)

    first = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=admin_auth_headers,
        json={"status": "DELIVERED"},
    )
    second = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=admin_auth_headers,
        json={"status": "DELIVERED"},
    )
    assert first.json()["delivered_at"] == second.json()["delivered_at"]


def test_non_admin_cannot_update_status(client, auth_headers):
    order_id = _create_order(client, auth_headers)
    response = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=auth_headers,
        json={"status": "DELIVERED"},
    )
    assert response.status_code == 403, response.text


def test_order_response_exposes_return_deadline(client, auth_headers, admin_auth_headers):
    order_id = _create_order(client, auth_headers)

    # Not yet delivered: no deadline surfaced.
    detail = client.get(f"{ORDERS_URL}{order_id}", headers=auth_headers)
    assert detail.status_code == 200, detail.text
    assert detail.json()["delivered_at"] is None
    assert detail.json()["return_deadline"] is None

    client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=admin_auth_headers,
        json={"status": "DELIVERED"},
    )

    detail = client.get(f"{ORDERS_URL}{order_id}", headers=auth_headers)
    assert detail.status_code == 200, detail.text
    assert detail.json()["delivered_at"] is not None
    assert detail.json()["return_deadline"] is not None

    delivered_at = datetime.fromisoformat(
        detail.json()["delivered_at"].replace("Z", "+00:00")
    )
    deadline = datetime.fromisoformat(
        detail.json()["return_deadline"].replace("Z", "+00:00")
    )
    assert (deadline - delivered_at).days == 30


def test_invalid_status_rejected(client, auth_headers, admin_auth_headers):
    order_id = _create_order(client, auth_headers)
    response = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=admin_auth_headers,
        json={"status": "IN_TRANSIT"},
    )
    assert response.status_code == 422, response.text
