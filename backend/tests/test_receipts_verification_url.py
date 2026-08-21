"""Regression test for the digital receipt verification_url (issue #7843).

The receipt payload must return a verification_url that actually resolves to a
working endpoint and validates the receipt signature.
"""
from tests.conftest import TestingSessionLocal
from app.models import Order, OrderItem

RECEIPTS_URL = "/api/receipts/"


def _seed_order() -> int:
    db = TestingSessionLocal()
    order = Order(
        full_name="Verify User",
        email="verify@example.com",
        address="1 Verify St",
        city="Verify City",
        zip_code="12345",
        total_amount=80.0,
        status="CONFIRMED",
    )
    db.add(order)
    db.flush()
    db.add(
        OrderItem(
            order_id=order.id,
            product_id=11,
            product_name="Verify Shirt",
            quantity=1,
            price=80.0,
        )
    )
    db.commit()
    db.refresh(order)
    order_id = order.id
    db.close()
    return order_id


def test_receipt_verification_url_resolves_and_validates(client):
    order_id = _seed_order()
    receipt = client.get(f"{RECEIPTS_URL}{order_id}/receipt")
    assert receipt.status_code == 200, receipt.text
    data = receipt.json()

    verification_url = data["verification_url"]
    # The URL must point at the receipts router mount (/api/receipts/...), not
    # the non-existent /api/orders/verify-receipt path.
    assert verification_url.startswith("/api/receipts/verify-receipt/"), verification_url

    # Following the returned URL must succeed (not 404) and validate the receipt.
    verify_response = client.get(verification_url)
    assert verify_response.status_code == 200, verify_response.text
    verified = verify_response.json()
    assert verified["valid"] is True
    assert verified["order_id"] == order_id
