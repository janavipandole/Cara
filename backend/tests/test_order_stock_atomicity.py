"""Stock must be guarded atomically (no oversell, never negative) even though
SQLite ignores SELECT ... FOR UPDATE."""
from passlib.context import CryptContext

from app.models import Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

EMAIL = "stockatom@example.com"


def _auth_headers(client):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == EMAIL).first()
    if user is None:
        db.add(
            User(
                username="stockatom",
                email=EMAIL,
                hashed_password=pwd.hash("Test@1234"),
            )
        )
        db.commit()
    db.close()
    response = client.post(
        "/api/auth/login",
        json={"email": EMAIL, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_product(stock=1):
    db = TestingSessionLocal()
    product = Product(
        brand="TestBrand",
        name="Atomic Tee",
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
    product_id = product.id
    db.close()
    return product_id


def _payload(product_id, quantity):
    return {
        "fullName": "Stock Atom",
        "email": EMAIL,
        "address": "1 Test St",
        "city": "Testville",
        "zip": "12345",
        "items": [{"product_id": product_id, "quantity": quantity}],
    }


def test_oversell_rejected_and_stock_untouched(client):
    headers = _auth_headers(client)
    product_id = _seed_product(stock=1)

    response = client.post(ORDERS_URL, json=_payload(product_id, 2), headers=headers)
    assert response.status_code == 400, response.text
    assert "Insufficient stock" in response.json()["detail"]

    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 1
    db.close()


def test_partial_stock_never_goes_negative(client):
    headers = _auth_headers(client)
    product_id = _seed_product(stock=3)

    assert (
        client.post(ORDERS_URL, json=_payload(product_id, 3), headers=headers).status_code
        == 201
    )

    # Exactly sold out — a further order must fail, not drive stock negative.
    response = client.post(ORDERS_URL, json=_payload(product_id, 1), headers=headers)
    assert response.status_code == 400, response.text

    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 0
    db.close()
