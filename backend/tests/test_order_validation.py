"""Tests for order create input validation."""
from passlib.context import CryptContext

from app.models import Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client, *, username="valuser", email="val@example.com"):
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


def test_create_order_rejects_empty_items(client):
    headers = _auth_headers(client)
    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "val@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [],
        },
    )
    assert response.status_code == 422


def test_create_order_rejects_quantity_over_limit(client):
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    product = Product(
        brand="TestBrand",
        name="Qty Cap Shirt",
        price=100.0,
        img="img.jpg",
        rating=4,
        category="minimal",
        stock=500,
    )
    db.add(product)
    db.commit()
    db.close()

    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "val@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Qty Cap Shirt", "quantity": 100}],
        },
    )
    assert response.status_code == 422
