"""Server-side coupon/loyalty/gift_wrap pricing on order create."""
from passlib.context import CryptContext

from app.models import Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client, *, email="pricing@example.com", username="pricinguser", points=0):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=username,
            email=email,
            hashed_password=pwd.hash("Test@1234"),
            loyalty_points=points,
        )
        db.add(user)
    else:
        user.loyalty_points = points
    db.commit()
    db.close()

    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_product(name="Pricing Tee", price=1000.0, stock=10):
    db = TestingSessionLocal()
    product = Product(
        brand="Cara",
        name=name,
        price=price,
        img="tee.jpg",
        rating=4,
        category="street",
        stock=stock,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    product_name = product.name
    db.close()
    return product_name


def _payload(product_name, **extra):
    body = {
        "fullName": "Pricing User",
        "email": "pricing@example.com",
        "address": "1 Test St",
        "city": "Testville",
        "zip": "12345",
        "items": [{"product_name": product_name, "quantity": 1}],
    }
    body.update(extra)
    return body


def test_coupon_discount_applied_server_side(client):
    name = _seed_product(price=1000.0)
    headers = _auth_headers(client)
    response = client.post(
        ORDERS_URL,
        headers=headers,
        json=_payload(name, coupon="CARA20"),
    )
    assert response.status_code == 201, response.text
    pricing = response.json()["pricing"]
    assert pricing["coupon_discount"] == 200.0
    # subtotal 1000 + tax 180 + shipping 150 - 200 = 1130
    assert pricing["grand_total"] == 1130.0
    assert response.json()["total_amount"] == 1130.0


def test_loyalty_points_validated_and_persisted(client):
    name = _seed_product(name="Loyalty Tee", price=1000.0)
    headers = _auth_headers(
        client, email="loyal@example.com", username="loyaluser", points=100
    )
    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            **_payload(name),
            "email": "loyal@example.com",
            "loyalty_points": 100,
        },
    )
    assert response.status_code == 201, response.text
    pricing = response.json()["pricing"]
    assert pricing["loyalty_discount"] == 10.0
    assert pricing["loyalty_points_redeemed"] == 100
    assert pricing["loyalty_points_earned"] == 100  # floor(1000 * 0.1)
    assert pricing["loyalty_points_balance"] == 100  # 100 - 100 + 100

    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "loyal@example.com").one()
    assert user.loyalty_points == 100
    db.close()


def test_loyalty_overdraft_rejected(client):
    name = _seed_product(name="Overdraft Tee", price=100.0)
    headers = _auth_headers(
        client, email="broke@example.com", username="brokeuser", points=5
    )
    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            **_payload(name),
            "email": "broke@example.com",
            "loyalty_points": 50,
        },
    )
    assert response.status_code == 400
    assert "Insufficient loyalty points" in response.json()["detail"]


def test_gift_wrap_added_to_total(client):
    name = _seed_product(name="Gift Tee", price=1000.0)
    headers = _auth_headers(client, email="gift@example.com", username="giftuser")
    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            **_payload(name),
            "email": "gift@example.com",
            "gift_wrap": True,
        },
    )
    assert response.status_code == 201, response.text
    pricing = response.json()["pricing"]
    assert pricing["gift_wrap"] == 99.0
    # 1000 + 180 + 150 + 99 = 1429
    assert pricing["grand_total"] == 1429.0
