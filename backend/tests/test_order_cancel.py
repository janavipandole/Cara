"""Tests for order cancel stock restoration."""
from passlib.context import CryptContext

from app.models import Product, Order, OrderItem, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client, *, username="canceluser", email="cancel@example.com"):
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
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _seed_product(db, **kwargs) -> Product:
    defaults = dict(
        brand="TestBrand",
        name="Cancel Restock Shirt",
        price=100.0,
        img="img.jpg",
        rating=4,
        category="minimal",
        subcategory="top",
        color="white",
        style="casual",
        stock=10,
    )
    defaults.update(kwargs)
    product = Product(**defaults)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def test_cancel_order_restores_stock(client):
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    _seed_product(db, name="Cancel Restock Shirt", stock=10)
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "cancel@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Cancel Restock Shirt", "quantity": 3}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    db = TestingSessionLocal()
    after_create = db.query(Product).filter(Product.name == "Cancel Restock Shirt").first()
    assert after_create.stock == 7
    db.close()

    cancel = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert cancel.status_code == 200, cancel.text
    assert cancel.json()["status"] == "CANCELLED"

    db = TestingSessionLocal()
    after_cancel = db.query(Product).filter(Product.name == "Cancel Restock Shirt").first()
    assert after_cancel.stock == 10
    order = db.query(Order).filter(Order.id == order_id).first()
    assert order.status == "CANCELLED"
    db.close()


def test_cancel_already_cancelled_does_not_double_restock(client):
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    _seed_product(db, name="Double Cancel Shirt", stock=5)
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "cancel@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Double Cancel Shirt", "quantity": 2}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    first = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert first.status_code == 200

    second = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert second.status_code == 400

    db = TestingSessionLocal()
    product = db.query(Product).filter(Product.name == "Double Cancel Shirt").first()
    assert product.stock == 5
    db.close()


def test_order_item_records_product_id(client):
    """Order items must snapshot the product_id at creation time."""
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    product = _seed_product(db, name="Snapshot Shirt", stock=10)
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "cancel@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Snapshot Shirt", "quantity": 1}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    db = TestingSessionLocal()
    item = db.query(OrderItem).filter(OrderItem.order_id == order_id).first()
    assert item.product_id == product.id
    db.close()


def test_cancel_after_product_rename_restores_stock(client):
    """Stock restore must follow product_id, so a rename cannot leak inventory."""
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    product = _seed_product(db, name="Rename Shirt", stock=10)
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "cancel@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Rename Shirt", "quantity": 3}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    # Simulate an admin renaming the product after the order was placed.
    db = TestingSessionLocal()
    db.query(Product).filter(Product.id == product.id).update({"name": "Renamed Tee"})
    db.commit()
    db.close()

    cancel = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert cancel.status_code == 200, cancel.text
    assert cancel.json()["status"] == "CANCELLED"

    db = TestingSessionLocal()
    after = db.query(Product).filter(Product.id == product.id).first()
    assert after.stock == 10
    db.close()


def test_cancel_with_deleted_product_reports_warning(client):
    """Missing products must surface a warning instead of silently leaking stock."""
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    product = _seed_product(db, name="Doomed Shirt", stock=5)
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "cancel@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Doomed Shirt", "quantity": 2}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    db = TestingSessionLocal()
    db.query(Product).filter(Product.id == product.id).delete()
    db.commit()
    db.close()

    cancel = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert cancel.status_code == 200, cancel.text
    body = cancel.json()
    assert body["status"] == "CANCELLED"
    assert "warning" in body


def test_cancel_with_null_created_at_does_not_crash(client):
    """A NULL created_at must not 500 the cancellation endpoint."""
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    _seed_product(db, name="Null Created Shirt", stock=7)
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "cancel@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Null Created Shirt", "quantity": 2}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    # Simulate a legacy row with a NULL created_at.
    db = TestingSessionLocal()
    db.query(Order).filter(Order.id == order_id).update({"created_at": None})
    db.commit()
    db.close()

    cancel = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert cancel.status_code == 200, cancel.text
    assert cancel.json()["status"] == "CANCELLED"
