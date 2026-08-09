"""Monetary values are stored as exact decimals and priced with Decimal math."""
from decimal import Decimal

from passlib.context import CryptContext

from app.models import Order, OrderItem, Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client, *, username="decimaluser", email="decimal@example.com"):
    db = TestingSessionLocal()
    if db.query(User).filter(User.email == email).first() is None:
        db.add(
            User(
                username=username,
                email=email,
                hashed_password=pwd.hash("Test@1234"),
            )
        )
        db.commit()
    db.close()

    resp = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Test@1234"},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _seed_product(db, *, name, price, stock=10) -> int:
    product = Product(
        brand="DecimalBrand",
        name=name,
        price=price,
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


def test_order_total_uses_exact_decimal_arithmetic(client):
    """0.10 + 0.20 must total exactly 150.35, not a float approximation."""
    headers = _auth_headers(client)
    db = TestingSessionLocal()
    cheap_id = _seed_product(db, name="Fraction 0.1", price=Decimal("0.10"))
    pricier_id = _seed_product(db, name="Fraction 0.2", price=Decimal("0.20"))
    db.close()

    create = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Decimal User",
            "email": "decimal@example.com",
            "address": "1 Decimal St",
            "city": "Decimalville",
            "zip": "12345",
            "items": [
                {"product_id": cheap_id, "quantity": 1},
                {"product_id": pricier_id, "quantity": 1},
            ],
        },
    )
    assert create.status_code == 201, create.text
    order_id = create.json()["order_id"]

    db = TestingSessionLocal()
    order = db.query(Order).filter(Order.id == order_id).one()
    assert isinstance(order.total_amount, Decimal)
    assert order.total_amount == Decimal("150.35")

    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order_id)
        .order_by(OrderItem.id.asc())
        .all()
    )
    assert all(isinstance(item.price, Decimal) for item in items)
    db.close()


def test_money_columns_are_numeric_not_float():
    from app.models import OrderItem, Product

    assert str(Product.__table__.c.price.type) == "NUMERIC(10, 2)"
    assert str(Order.__table__.c.total_amount.type) == "NUMERIC(10, 2)"
    assert str(OrderItem.__table__.c.price.type) == "NUMERIC(10, 2)"
