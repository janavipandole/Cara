"""Order idempotency: per-buyer uniqueness and IntegrityError replay."""
from passlib.context import CryptContext

from app.models import Product, User, Order
from tests.conftest import TestingSessionLocal

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _login_headers(client, email, password, username):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=username,
            email=email,
            hashed_password=pwd.hash(password),
        )
        db.add(user)
        db.commit()
    db.close()

    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_product(name="Idempotency Tee", stock=20):
    db = TestingSessionLocal()
    product = db.query(Product).filter(Product.name == name).first()
    if product is None:
        product = Product(
            brand="Cara",
            name=name,
            price=100.0,
            img="tee.jpg",
            rating=4,
            category="street",
            stock=stock,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
    product_id = product.id
    db.close()
    return product_id


def _order_payload(key, product_id, email="idem1@example.com"):
    return {
        "fullName": "Buyer One",
        "email": email,
        "address": "1 Test St",
        "city": "Testville",
        "zip": "10001",
        "items": [{"product_id": product_id, "quantity": 1}],
        "idempotency_key": key,
    }


def test_duplicate_idempotency_key_returns_existing(client):
    product_id = _seed_product()
    headers = _login_headers(client, "idem1@example.com", "Secure123@", "idem1")
    payload = _order_payload("key-same-user-1", product_id)

    first = client.post("/api/orders/", json=payload, headers=headers)
    assert first.status_code == 201
    order_id = first.json()["order_id"]

    second = client.post("/api/orders/", json=payload, headers=headers)
    assert second.status_code == 200
    assert second.json()["message"] == "Order already created"
    assert second.json()["order_id"] == order_id


def test_same_key_allowed_for_different_buyers(client):
    product_id = _seed_product(name="Shared Key Tee")
    headers_a = _login_headers(client, "idem-a@example.com", "Secure123@", "idema")
    headers_b = _login_headers(client, "idem-b@example.com", "Secure123@", "idemb")

    first = client.post(
        "/api/orders/",
        json=_order_payload(
            "shared-key-across-users",
            product_id,
            email="idem-a@example.com",
        ),
        headers=headers_a,
    )
    second = client.post(
        "/api/orders/",
        json={
            **_order_payload(
                "shared-key-across-users",
                product_id,
                email="idem-b@example.com",
            ),
            "fullName": "Buyer Two",
        },
        headers=headers_b,
    )

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["order_id"] != second.json()["order_id"]


def test_integrity_error_race_returns_existing_order(client, monkeypatch):
    product_id = _seed_product(name="Race Tee")
    headers = _login_headers(client, "idem-race@example.com", "Secure123@", "idemrace")
    key = "race-key-1"

    # Seed a winning order row that a racing request would collide with.
    db = TestingSessionLocal()
    db.add(
        Order(
            full_name="Winner",
            email="idem-race@example.com",
            address="1 Test St",
            city="Testville",
            zip_code="10001",
            total_amount=10.0,
            status="CONFIRMED",
            idempotency_key=key,
        )
    )
    db.commit()
    existing_id = (
        db.query(Order)
        .filter(Order.email == "idem-race@example.com", Order.idempotency_key == key)
        .one()
        .id
    )
    db.close()

    # Force only the pre-check to miss; IntegrityError handler must still look up.
    from app.api import orders as orders_api

    real_lookup = orders_api._existing_order_for_key
    calls = {"n": 0}

    def flaky_lookup(db, email, idempotency_key):
        calls["n"] += 1
        if calls["n"] == 1:
            return None
        return real_lookup(db, email, idempotency_key)

    monkeypatch.setattr(orders_api, "_existing_order_for_key", flaky_lookup)

    response = client.post(
        "/api/orders/",
        json=_order_payload(key, product_id, email="idem-race@example.com"),
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["order_id"] == existing_id
    assert response.json()["message"] == "Order already created"
