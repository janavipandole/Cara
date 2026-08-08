"""Checkout email must match the authenticated account."""
from passlib.context import CryptContext

from app.models import Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client):
    db = TestingSessionLocal()
    if db.query(User).filter(User.email == "emailmatch@example.com").first() is None:
        db.add(
            User(
                username="emailmatch",
                email="emailmatch@example.com",
                hashed_password=pwd.hash("Test@1234"),
            )
        )
        db.commit()
    db.close()
    login = client.post(
        "/api/auth/login",
        json={"email": "emailmatch@example.com", "password": "Test@1234"},
    )
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_create_order_rejects_mismatched_email(client):
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    db.add(
        Product(
            brand="B",
            name="Email Match Shirt",
            price=50.0,
            img="x.jpg",
            rating=4,
            category="minimal",
            stock=5,
        )
    )
    db.commit()
    db.close()

    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Test User",
            "email": "someone-else@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_name": "Email Match Shirt", "quantity": 1, "size": "M"}],
        },
    )
    assert response.status_code == 400
    assert "must match" in response.json()["detail"]
