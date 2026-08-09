"""Admin order-status state machine and stock restoration."""
from passlib.context import CryptContext

from app import models
from tests.conftest import TestingSessionLocal

STATUS_URL = "/api/admin/orders/{}/status"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _make_admin(client, *, email="admin_status@example.com", username="adminstatus"):
    db = TestingSessionLocal()
    if db.query(models.User).filter(models.User.email == email).first() is None:
        db.add(
            models.User(
                username=username,
                email=email,
                hashed_password=pwd.hash("Admin@1234"),
                role="ADMIN",
            )
        )
        db.commit()
    db.close()

    resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Admin@1234"},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _make_buyer(client, *, email="buyer_status@example.com", username="buyerstatus"):
    db = TestingSessionLocal()
    if db.query(models.User).filter(models.User.email == email).first() is None:
        db.add(
            models.User(
                username=username,
                email=email,
                hashed_password=pwd.hash("Buyer@1234"),
            )
        )
        db.commit()
    db.close()

    resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Buyer@1234"},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _seed_product(db, *, name, stock=10) -> int:
    product = models.Product(
        brand="StatusBrand",
        name=name,
        price=100.0,
        img="img.jpg",
        rating=4,
        category="minimal",
        subcategory="top",
        color="white",
        style="casual",
        stock=stock,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product.id


def _create_order(client, headers, *, email, items) -> int:
    resp = client.post(
        "/api/orders/",
        headers=headers,
        json={
            "fullName": "Status User",
            "email": email,
            "address": "1 Status St",
            "city": "Statusville",
            "zip": "12345",
            "items": items,
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["order_id"]


def _set_status(client, headers, order_id, status):
    return client.post(STATUS_URL.format(order_id), headers=headers, json={"status": status})


def test_admin_progresses_order_through_fulfillment(client):
    admin_headers = _make_admin(client)
    buyer_headers = _make_buyer(client)
    db = TestingSessionLocal()
    product_id = _seed_product(db, name="Fulfillment Tee", stock=10)
    db.close()

    order_id = _create_order(
        client, buyer_headers, email="buyer_status@example.com",
        items=[{"product_id": product_id, "quantity": 2}],
    )

    shipped = _set_status(client, admin_headers, order_id, "SHIPPED")
    assert shipped.status_code == 200, shipped.text
    assert shipped.json()["status"] == "SHIPPED"

    delivered = _set_status(client, admin_headers, order_id, "DELIVERED")
    assert delivered.status_code == 200, delivered.text
    assert delivered.json()["status"] == "DELIVERED"
    assert delivered.json()["delivered_at"] is not None


def test_admin_cannot_cancel_shipped_or_delivered_order(client):
    admin_headers = _make_admin(client)
    buyer_headers = _make_buyer(client)
    db = TestingSessionLocal()
    product_id = _seed_product(db, name="Ship Then Cancel Tee", stock=5)
    db.close()

    order_id = _create_order(
        client, buyer_headers, email="buyer_status@example.com",
        items=[{"product_id": product_id, "quantity": 1}],
    )
    assert _set_status(client, admin_headers, order_id, "SHIPPED").status_code == 200

    cancelled = _set_status(client, admin_headers, order_id, "CANCELLED")
    assert cancelled.status_code == 400
    db = TestingSessionLocal()
    order = db.query(models.Order).filter(models.Order.id == order_id).one()
    assert order.status == "SHIPPED"
    assert db.query(models.Product).filter(models.Product.id == product_id).one().stock == 4
    db.close()


def test_admin_cannot_revert_a_terminal_state(client):
    admin_headers = _make_admin(client)
    buyer_headers = _make_buyer(client)
    db = TestingSessionLocal()
    product_id = _seed_product(db, name="Deliver Then Revert Tee", stock=5)
    db.close()

    order_id = _create_order(
        client, buyer_headers, email="buyer_status@example.com",
        items=[{"product_id": product_id, "quantity": 1}],
    )
    _set_status(client, admin_headers, order_id, "SHIPPED")
    assert _set_status(client, admin_headers, order_id, "DELIVERED").status_code == 200

    backward = _set_status(client, admin_headers, order_id, "SHIPPED")
    assert backward.status_code == 400
    db = TestingSessionLocal()
    assert db.query(models.Order).filter(models.Order.id == order_id).one().status == "DELIVERED"
    db.close()


def test_admin_cancel_restores_stock_once(client):
    admin_headers = _make_admin(client)
    buyer_headers = _make_buyer(client)
    db = TestingSessionLocal()
    product_id = _seed_product(db, name="Cancel Restore Tee", stock=10)
    db.close()

    order_id = _create_order(
        client, buyer_headers, email="buyer_status@example.com",
        items=[{"product_id": product_id, "quantity": 3}],
    )

    db = TestingSessionLocal()
    assert db.query(models.Product).filter(models.Product.id == product_id).one().stock == 7
    db.close()

    first = _set_status(client, admin_headers, order_id, "CANCELLED")
    assert first.status_code == 200, first.text

    db = TestingSessionLocal()
    product = db.query(models.Product).filter(models.Product.id == product_id).one()
    assert product.stock == 10
    db.close()

    # Same-status call is a no-op and must not restore stock a second time.
    second = _set_status(client, admin_headers, order_id, "CANCELLED")
    assert second.status_code == 200
    db = TestingSessionLocal()
    assert db.query(models.Product).filter(models.Product.id == product_id).one().stock == 10
    assert db.query(models.Order).filter(models.Order.id == order_id).one().status == "CANCELLED"
    db.close()


def test_admin_cannot_un_cancel_an_order(client):
    admin_headers = _make_admin(client)
    buyer_headers = _make_buyer(client)
    db = TestingSessionLocal()
    product_id = _seed_product(db, name="Uncancel Tee", stock=5)
    db.close()

    order_id = _create_order(
        client, buyer_headers, email="buyer_status@example.com",
        items=[{"product_id": product_id, "quantity": 1}],
    )
    assert _set_status(client, admin_headers, order_id, "CANCELLED").status_code == 200

    revive = _set_status(client, admin_headers, order_id, "CONFIRMED")
    assert revive.status_code == 400
