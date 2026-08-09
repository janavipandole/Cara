"""Tests for POST /api/newsletter/restock."""
from app.models import Product, RestockAlert
from tests.conftest import TestingSessionLocal

RESTOCK_URL = "/api/newsletter/restock"


def _seed_product(name="Restock Tee", stock=0):
    db = TestingSessionLocal()
    product = Product(
        brand="Cara",
        name=name,
        price=100.0,
        img="tee.jpg",
        rating=4,
        category="street",
        stock=stock,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    pid = product.id
    db.close()
    return pid


def test_restock_alert_registers(client):
    pid = _seed_product()
    r = client.post(RESTOCK_URL, json={"email": "restock@example.com", "product_id": pid})
    assert r.status_code == 201
    assert r.json()["message"] == "Restock alert registered"

    db = TestingSessionLocal()
    alert = (
        db.query(RestockAlert)
        .filter(
            RestockAlert.email == "restock@example.com",
            RestockAlert.product_id == pid,
        )
        .first()
    )
    db.close()
    assert alert is not None


def test_restock_alert_is_idempotent_per_product(client):
    pid = _seed_product(name="Restock Idem Tee")
    for _ in range(2):
        r = client.post(
            RESTOCK_URL,
            json={"email": "restock-idem@example.com", "product_id": pid},
        )
        assert r.status_code == 201

    db = TestingSessionLocal()
    count = (
        db.query(RestockAlert)
        .filter(
            RestockAlert.email == "restock-idem@example.com",
            RestockAlert.product_id == pid,
        )
        .count()
    )
    db.close()
    assert count == 1


def test_restock_alert_allows_same_email_for_different_products(client):
    pid_a = _seed_product(name="Restock A Tee")
    pid_b = _seed_product(name="Restock B Tee")
    for pid in (pid_a, pid_b):
        r = client.post(
            RESTOCK_URL,
            json={"email": "restock-multi@example.com", "product_id": pid},
        )
        assert r.status_code == 201

    db = TestingSessionLocal()
    count = (
        db.query(RestockAlert)
        .filter(RestockAlert.email == "restock-multi@example.com")
        .count()
    )
    db.close()
    assert count == 2


def test_restock_alert_rejects_unknown_product(client):
    r = client.post(
        RESTOCK_URL, json={"email": "restock-ghost@example.com", "product_id": 999999}
    )
    assert r.status_code == 404


def test_restock_alert_rejects_invalid_email(client):
    pid = _seed_product(name="Restock Bad Email Tee")
    r = client.post(RESTOCK_URL, json={"email": "not-an-email", "product_id": pid})
    assert r.status_code == 422
