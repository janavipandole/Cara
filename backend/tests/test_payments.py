"""Stripe payment config + order PENDING for online checkout."""
from passlib.context import CryptContext

from app.models import Product, User, Order
from tests.conftest import TestingSessionLocal

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _auth_headers(client):
    db = TestingSessionLocal()
    email = "payuser@example.com"
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        db.add(
            User(
                username="payuser",
                email=email,
                hashed_password=pwd.hash("Test@1234"),
            )
        )
        db.commit()
    db.close()
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Test@1234"},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_product():
    db = TestingSessionLocal()
    product = Product(
        brand="Cara",
        name="Pay Tee",
        price=500.0,
        img="tee.jpg",
        rating=4,
        category="street",
        stock=5,
    )
    db.add(product)
    db.commit()
    name = product.name
    db.close()
    return name


def test_payments_config_disabled_without_keys(client):
    response = client.get("/api/payments/config")
    assert response.status_code == 200
    body = response.json()
    assert body["enabled"] is False
    assert body["provider"] == "stripe"


def test_online_order_rejected_without_stripe(client):
    name = _seed_product()
    headers = _auth_headers(client)
    response = client.post(
        "/api/orders/",
        headers=headers,
        json={
            "fullName": "Pay User",
            "email": "payuser@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "payment_method": "online",
            "items": [{"product_name": name, "quantity": 1}],
        },
    )
    assert response.status_code == 503


def test_cod_order_confirmed_immediately(client):
    name = _seed_product()
    headers = _auth_headers(client)
    response = client.post(
        "/api/orders/",
        headers=headers,
        json={
            "fullName": "Pay User",
            "email": "payuser@example.com",
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "payment_method": "cod",
            "items": [{"product_name": name, "quantity": 1}],
        },
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["status"] == "CONFIRMED"
    assert body["needs_payment"] is False

    db = TestingSessionLocal()
    order = db.query(Order).filter(Order.id == body["order_id"]).one()
    assert order.status == "CONFIRMED"
    assert order.payment_method == "cod"
    db.close()


def test_webhook_confirms_pending_order(client, monkeypatch):
    """Simulate a verified Stripe webhook marking the order CONFIRMED."""
    db = TestingSessionLocal()
    order = Order(
        full_name="Webhook User",
        email="payuser@example.com",
        address="1 Test St",
        city="Testville",
        zip_code="12345",
        total_amount=100.0,
        status="PENDING",
        payment_method="online",
        payment_intent_id="pi_test_123",
    )
    db.add(order)
    db.commit()
    order_id = order.id
    db.close()

    monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_dummy")
    monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_dummy")

    from app.api import payments as payments_api

    class FakeEvent(dict):
        pass

    def fake_construct_event(payload, sig, secret):
        return {
            "type": "payment_intent.succeeded",
            "data": {"object": {"id": "pi_test_123"}},
        }

    monkeypatch.setattr(payments_api.stripe.Webhook, "construct_event", fake_construct_event)

    response = client.post(
        "/api/payments/webhook",
        content=b"{}",
        headers={"Stripe-Signature": "t=1,v1=abc"},
    )
    assert response.status_code == 200

    db = TestingSessionLocal()
    order = db.query(Order).filter(Order.id == order_id).one()
    assert order.status == "CONFIRMED"
    db.close()
