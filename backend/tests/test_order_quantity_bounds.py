"""Quantity bounds for order line items (replaces removed CheckoutItem schema)."""
from passlib.context import CryptContext

from app.models import Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client):
    db = TestingSessionLocal()
    email = "qtybounds@example.com"
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username="qtybounds",
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


def _seed_product(stock=100):
    db = TestingSessionLocal()
    product = Product(
        brand="Cara",
        name="Qty Bound Tee",
        price=50.0,
        img="tee.jpg",
        rating=4,
        category="street",
        stock=stock,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    name = product.name
    db.close()
    return name


def _payload(quantity, product_name="Qty Bound Tee"):
    return {
        "fullName": "Qty User",
        "email": "qtybounds@example.com",
        "address": "1 Test St",
        "city": "Testville",
        "zip": "12345",
        "items": [{"product_name": product_name, "quantity": quantity}],
    }


def test_quantity_zero_rejected(client):
    _seed_product()
    headers = _auth_headers(client)
    response = client.post(ORDERS_URL, json=_payload(0), headers=headers)
    assert response.status_code == 422


def test_quantity_negative_rejected(client):
    _seed_product()
    headers = _auth_headers(client)
    response = client.post(ORDERS_URL, json=_payload(-1), headers=headers)
    assert response.status_code == 422


def test_quantity_above_max_rejected(client):
    _seed_product()
    headers = _auth_headers(client)
    response = client.post(ORDERS_URL, json=_payload(100), headers=headers)
    assert response.status_code == 422


def test_quantity_at_max_accepted(client):
    _seed_product(stock=100)
    headers = _auth_headers(client)
    response = client.post(ORDERS_URL, json=_payload(99), headers=headers)
    assert response.status_code == 201, response.text


def test_products_checkout_schema_gone(client):
    """Legacy unauthenticated CheckoutItem endpoint must stay removed."""
    response = client.post(
        "/api/products/checkout",
        json={"items": [{"name": "Anything", "quantity": -5}]},
    )
    assert response.status_code in (404, 405, 422)
