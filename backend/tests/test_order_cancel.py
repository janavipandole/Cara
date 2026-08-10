"""Tests for order cancel stock restoration."""
from passlib.context import CryptContext

from app.models import Product, Order, User
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
    product = _seed_product(db, name="Cancel Restock Shirt", stock=10)
    product_id = product.id
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
            "items": [{"product_id": product_id, "quantity": 3}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    db = TestingSessionLocal()
    after_create = db.query(Product).filter(Product.id == product_id).first()
    assert after_create.stock == 7
    db.close()

    cancel = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert cancel.status_code == 200, cancel.text
    assert cancel.json()["status"] == "CANCELLED"

    db = TestingSessionLocal()
    after_cancel = db.query(Product).filter(Product.id == product_id).first()
    assert after_cancel.stock == 10
    order = db.query(Order).filter(Order.id == order_id).first()
    assert order.status == "CANCELLED"
    db.close()


def test_cancel_already_cancelled_does_not_double_restock(client):
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    product = _seed_product(db, name="Double Cancel Shirt", stock=5)
    product_id = product.id
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
            "items": [{"product_id": product_id, "quantity": 2}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    first = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert first.status_code == 200

    second = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert second.status_code == 400

    db = TestingSessionLocal()
    product = db.query(Product).filter(Product.id == product_id).first()
    assert product.stock == 5
    db.close()


def _create_order_and_set_status(client, headers, *, email, product_name, quantity, status):
    db = TestingSessionLocal()
    product = _seed_product(db, name=product_name, stock=10)
    product_id = product.id
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": email,
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_id": product_id, "quantity": quantity}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    # Simulate a carrier/fulfillment marking the order as progressed while
    # still inside the 24h cancel window (issue #5625).
    db = TestingSessionLocal()
    order = db.query(Order).filter(Order.id == order_id).one()
    order.status = status
    db.commit()
    db.close()
    return order_id, product_id


def test_cancel_rejected_for_shipped_order_within_window(client):
    headers = _auth_headers(client, username="shipuser", email="ship@example.com")
    order_id, product_id = _create_order_and_set_status(
        client,
        headers,
        email="ship@example.com",
        product_name="Shipped Tee",
        quantity=2,
        status="SHIPPED",
    )

    response = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert response.status_code == 400, response.text

    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 8
    assert db.query(Order).filter(Order.id == order_id).one().status == "SHIPPED"
    db.close()


def test_cancel_rejected_for_delivered_order_within_window(client):
    headers = _auth_headers(client, username="deliveruser", email="deliver@example.com")
    order_id, product_id = _create_order_and_set_status(
        client,
        headers,
        email="deliver@example.com",
        product_name="Delivered Tee",
        quantity=4,
        status="DELIVERED",
    )

    response = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert response.status_code == 400, response.text

    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 6
    assert db.query(Order).filter(Order.id == order_id).one().status == "DELIVERED"
    db.close()


def test_order_uses_product_id_when_duplicate_names_exist(client):
    """Duplicate product names must resolve by id, not the first matching name."""
    headers = _auth_headers(client, username="dupuser", email="dup@example.com")
    db = TestingSessionLocal()
    cheap = _seed_product(db, name="Same Name Tee", price=10.0, stock=5)
    expensive = _seed_product(db, name="Same Name Tee", price=999.0, stock=5)
    cheap_id, expensive_id = cheap.id, expensive.id
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Dup User",
            "email": "dup@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_id": expensive_id, "quantity": 1}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    db = TestingSessionLocal()
    cheap_after = db.query(Product).filter(Product.id == cheap_id).first()
    expensive_after = db.query(Product).filter(Product.id == expensive_id).first()
    assert cheap_after.stock == 5
    assert expensive_after.stock == 4

    from app.models import OrderItem

    item = db.query(OrderItem).filter(OrderItem.order_id == order_id).one()
    assert item.product_id == expensive_id
    assert item.price == 999.0
    db.close()


def test_cancel_rejected_outside_24h_window(client):
    from datetime import datetime, timedelta, timezone
    from app.models import OrderItem

    headers = _auth_headers(client, username="olduser", email="old@example.com")
    db = TestingSessionLocal()
    product = _seed_product(db, name="Old Window Shirt", stock=10)
    product_id = product.id
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Old User",
            "email": "old@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_id": product_id, "quantity": 1}],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    # Age the order beyond the 24h cancellable window while keeping the
    # status cancellable (CONFIRMED).
    db = TestingSessionLocal()
    order = db.query(Order).filter(Order.id == order_id).one()
    order.created_at = datetime.now(timezone.utc) - timedelta(hours=25)
    db.commit()
    db.close()

    response = client.post(f"{ORDERS_URL}{order_id}/cancel", headers=headers)
    assert response.status_code == 400, response.text
    assert "within 24 hours" in response.json()["detail"]

    # Stock must NOT be restored since the cancellation was rejected.
    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 9
    assert db.query(Order).filter(Order.id == order_id).one().status == "CONFIRMED"
    assert db.query(OrderItem).filter(OrderItem.order_id == order_id).count() == 1
    db.close()
