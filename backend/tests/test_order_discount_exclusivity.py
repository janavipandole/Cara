"""Discount exclusivity: promo codes can never stack on site-wide sales.

Regression tests for https://github.com/janavipandole/Cara/issues/6296 —
POST /api/orders/ previously applied a promo code on top of the auto-applied
site-wide sale, giving the customer BOTH discounts and eroding margin. The
backend must now apply only the better offer ("Best Offer Only").

Totals for the seeded cart (2x formal Tee @ ₹500, subtotal ₹1000):
  shipping ₹150, tax ₹180 (18%). A 20% discount gives ₹200 off → grand ₹1130.
  The old stacking bug would apply ₹200 sale + ₹200 promo = ₹400 → grand ₹930.
"""
import app.api.orders as orders_api
from passlib.context import CryptContext

from app.models import Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

USER_EMAIL = "discountexclusivity@example.com"

PRICE = 500.0
QTY = 2
SALE_DISCOUNT = round(PRICE * QTY * 20 / 100, 2)  # 200.0


def _auth_headers(client):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == USER_EMAIL).first()
    if user is None:
        user = User(
            username="discountexclusivity",
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


def _seed_product(name, category, price=PRICE, stock=100):
    db = TestingSessionLocal()
    product = Product(
        brand="TestBrand",
        name=name,
        price=price,
        img="img.jpg",
        rating=4,
        category=category,
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


def _create_order(client, product_id, coupon=None):
    headers = _auth_headers(client)
    payload = {
        "fullName": "Exclusivity User",
        "email": USER_EMAIL,
        "address": "1 Test St",
        "city": "Testville",
        "zip": "12345",
        "items": [{"product_id": product_id, "quantity": QTY}],
    }
    if coupon:
        payload["coupon"] = coupon
    response = client.post(ORDERS_URL, json=payload, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_site_wide_sale_applied_without_coupon(client):
    product_id = _seed_product("Formal Sale Tee", category="formal")
    data = _create_order(client, product_id)

    assert data["discount"] == SALE_DISCOUNT
    assert data["discount_source"] == "site-wide-sale"
    assert data["grand_total"] == 1130.0


def test_promo_not_stacked_on_site_wide_sale(client):
    product_id = _seed_product("Formal Stack Tee", category="formal")
    data = _create_order(client, product_id, coupon="CARA20")

    # CARA20 (20%) ties the site-wide sale (20%) — sale wins the tie. Total
    # discount must be ₹200 (ONE offer), never ₹400 (stacked).
    assert data["discount"] == SALE_DISCOUNT
    assert data["discount_source"] == "site-wide-sale"
    assert data["grand_total"] == 1130.0


def test_weaker_promo_loses_to_site_wide_sale(client):
    product_id = _seed_product("Formal Weak Promo Tee", category="formal")
    data = _create_order(client, product_id, coupon="WELCOME10")

    # WELCOME10 (10% = ₹100) is worse than the 20% sale (₹200).
    assert data["discount"] == SALE_DISCOUNT
    assert data["discount_source"] == "site-wide-sale"
    assert data["grand_total"] == 1130.0


def test_promo_wins_when_better_than_sale(client, monkeypatch):
    # A smaller sale (5%) makes the CARA20 promo the better offer.
    monkeypatch.setattr(orders_api, "SITE_WIDE_SALES", {"formal": 5})
    product_id = _seed_product("Formal Promo Wins Tee", category="formal")
    data = _create_order(client, product_id, coupon="CARA20")

    assert data["discount"] == 200.0
    assert data["discount_source"] == "promo"
    assert data["grand_total"] == 1130.0


def test_promo_applies_normally_outside_sale_category(client):
    product_id = _seed_product("Minimal Tee", category="minimal")
    data = _create_order(client, product_id, coupon="CARA20")

    assert data["discount"] == 200.0
    assert data["discount_source"] == "promo"
    assert data["grand_total"] == 1130.0
