"""Order creation validation: empty carts and out-of-range quantities are rejected.

Regression tests for https://github.com/janavipandole/Cara/issues/5621 —
POST /api/orders/ previously accepted `items: []` and created a shipping-only
₹150 order, and accepted unbounded line quantities.
"""
from passlib.context import CryptContext

from app.models import Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

USER_EMAIL = "ordervalidation@example.com"


def _auth_headers(client):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == USER_EMAIL).first()
    if user is None:
        user = User(
            username="ordervalidation",
            email=USER_EMAIL,
            hashed_password=pwd.hash("Test@1234"),
        )
        db.add(user)
        db.commit()
    db.close()

    response = client.post(
        "/api/auth/login",
        json={"email": USER_EMAIL, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_product(name="Validation Tee", stock=100):
    db = TestingSessionLocal()
    product = Product(
        brand="TestBrand",
        name=name,
        price=500.0,
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
    product_id = product.id
    db.close()
    return product_id


def _payload(items):
    return {
        "fullName": "Validation User",
        "email": USER_EMAIL,
        "address": "1 Test St",
        "city": "Testville",
        "zip": "12345",
        "items": items,
    }


def test_empty_items_rejected(client):
    headers = _auth_headers(client)
    response = client.post(ORDERS_URL, json=_payload([]), headers=headers)
    assert response.status_code == 422, response.text


def test_zero_quantity_rejected(client):
    headers = _auth_headers(client)
    product_id = _seed_product()
    response = client.post(
        ORDERS_URL,
        json=_payload([{"product_id": product_id, "quantity": 0}]),
        headers=headers,
    )
    assert response.status_code == 422, response.text


def test_negative_quantity_rejected(client):
    headers = _auth_headers(client)
    product_id = _seed_product()
    response = client.post(
        ORDERS_URL,
        json=_payload([{"product_id": product_id, "quantity": -3}]),
        headers=headers,
    )
    assert response.status_code == 422, response.text


def test_quantity_above_cap_rejected(client):
    headers = _auth_headers(client)
    product_id = _seed_product()
    response = client.post(
        ORDERS_URL,
        json=_payload([{"product_id": product_id, "quantity": 100}]),
        headers=headers,
    )
    assert response.status_code == 422, response.text


def test_too_many_line_items_rejected(client):
    headers = _auth_headers(client)
    product_id = _seed_product()
    items = [{"product_id": product_id, "quantity": 1} for _ in range(51)]
    response = client.post(ORDERS_URL, json=_payload(items), headers=headers)
    assert response.status_code == 422, response.text


def test_valid_order_still_succeeds(client):
    headers = _auth_headers(client)
    product_id = _seed_product()
    response = client.post(
        ORDERS_URL,
        json=_payload([{"product_id": product_id, "quantity": 2}]),
        headers=headers,
    )
    assert response.status_code == 201, response.text
    assert "order_id" in response.json()
