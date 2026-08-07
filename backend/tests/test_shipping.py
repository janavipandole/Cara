"""Shipping fee is charged the way the checkout summary shows it."""
from passlib.context import CryptContext

from app.models import Product, User, Order
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client, *, email="shipping@example.com"):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username="shippinguser",
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


def _seed_product(name, price, stock=10):
    db = TestingSessionLocal()
    product = db.query(Product).filter(Product.name == name).first()
    if product is None:
        product = Product(
            brand="TestBrand",
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
    db.close()


def _place_order(client, headers, product_name, quantity, shipping_method=None):
    payload = {
        "fullName": "Test User",
        "email": "shipping@example.com",
        "address": "1 Test St",
        "city": "Testville",
        "zip": "12345",
        "items": [{"product_name": product_name, "quantity": quantity}],
    }
    if shipping_method is not None:
        payload["shipping_method"] = shipping_method
    return client.post(ORDERS_URL, headers=headers, json=payload)


def _fetch_order_total(order_id):
    db = TestingSessionLocal()
    order = db.query(Order).filter(Order.id == order_id).first()
    total = order.total_amount
    db.close()
    return total


def test_standard_shipping_below_threshold(client):
    headers = _auth_headers(client)
    _seed_product("Std Below Tee", price=100.0)
    resp = _place_order(client, headers, "Std Below Tee", 2)
    assert resp.status_code == 201, resp.text
    # subtotal 200 + 18% tax 36 + shipping 150
    assert _fetch_order_total(resp.json()["order_id"]) == 386.0


def test_standard_shipping_free_above_threshold(client):
    headers = _auth_headers(client)
    _seed_product("Std Free Tee", price=2000.0)
    resp = _place_order(client, headers, "Std Free Tee", 2)
    assert resp.status_code == 201, resp.text
    # subtotal 4000 + 18% tax 720 + free shipping
    assert _fetch_order_total(resp.json()["order_id"]) == 4720.0


def test_express_shipping_surcharge(client):
    headers = _auth_headers(client)
    _seed_product("Express Tee", price=100.0)
    resp = _place_order(client, headers, "Express Tee", 2, shipping_method="express")
    assert resp.status_code == 201, resp.text
    # subtotal 200 + tax 36 + shipping (150 base + 150 express)
    assert _fetch_order_total(resp.json()["order_id"]) == 536.0


def test_international_shipping_surcharge(client):
    headers = _auth_headers(client)
    _seed_product("Intl Tee", price=100.0)
    resp = _place_order(client, headers, "Intl Tee", 2, shipping_method="international")
    assert resp.status_code == 201, resp.text
    # subtotal 200 + tax 36 + shipping (150 base + 450 international)
    assert _fetch_order_total(resp.json()["order_id"]) == 836.0


def test_invalid_shipping_method_rejected(client):
    headers = _auth_headers(client)
    _seed_product("Bad Method Tee", price=100.0)
    resp = _place_order(client, headers, "Bad Method Tee", 1, shipping_method="rocket")
    assert resp.status_code == 422
