"""Admin order status transitions: FSM + cancel restock."""
from passlib.context import CryptContext

from app.models import Order, Product, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

USER_EMAIL = "admin-status-user@example.com"
ADMIN_EMAIL = "admin-status-admin@example.com"


def _ensure_user(email, username, *, role="USER"):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        user = User(
            username=username,
            email=email,
            hashed_password=pwd.hash("Test@1234"),
            role=role,
        )
        db.add(user)
        db.commit()
    db.close()


def _auth_headers(client, *, email=USER_EMAIL, username="adminstatususer"):
    _ensure_user(email, username)
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _admin_headers(client):
    _ensure_user(ADMIN_EMAIL, "adminstatusadmin", role="ADMIN")
    response = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def _seed_product(name="Admin Status Tee", stock=10):
    db = TestingSessionLocal()
    product = Product(
        brand="Cara",
        name=name,
        price=100.0,
        img="tee.jpg",
        rating=4,
        category="minimal",
        stock=stock,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    product_id = product.id
    db.close()
    return product_id


def _create_order(client, headers, *, product_id, quantity=3):
    response = client.post(
        ORDERS_URL,
        headers=headers,
        json={
            "fullName": "Status User",
            "email": USER_EMAIL,
            "address": "1 Test St",
            "city": "Testville",
            "zip": "12345",
            "items": [{"product_id": product_id, "quantity": quantity}],
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["order_id"]


def test_admin_cancel_restores_stock(client):
    headers = _auth_headers(client)
    product_id = _seed_product(stock=10)
    order_id = _create_order(client, headers, product_id=product_id, quantity=3)

    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 7
    db.close()

    cancel = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "CANCELLED"},
    )
    assert cancel.status_code == 200, cancel.text
    assert cancel.json()["status"] == "CANCELLED"

    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 10
    assert db.query(Order).filter(Order.id == order_id).one().status == "CANCELLED"
    db.close()


def test_admin_cancel_rejected_for_shipped_order(client):
    headers = _auth_headers(client)
    product_id = _seed_product(name="Shipped Admin Tee", stock=10)
    order_id = _create_order(client, headers, product_id=product_id, quantity=2)

    shipped = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "SHIPPED"},
    )
    assert shipped.status_code == 200, shipped.text

    cancel = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "CANCELLED"},
    )
    assert cancel.status_code == 400, cancel.text

    db = TestingSessionLocal()
    assert db.query(Product).filter(Product.id == product_id).one().stock == 8
    assert db.query(Order).filter(Order.id == order_id).one().status == "SHIPPED"
    db.close()


def test_illegal_status_transition_rejected(client):
    headers = _auth_headers(client)
    product_id = _seed_product(name="FSM Tee", stock=5)
    order_id = _create_order(client, headers, product_id=product_id, quantity=1)

    # CONFIRMED -> DELIVERED skips SHIPPED and must fail.
    bad = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "DELIVERED"},
    )
    assert bad.status_code == 400, bad.text

    shipped = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "SHIPPED"},
    )
    assert shipped.status_code == 200, shipped.text

    delivered = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "DELIVERED"},
    )
    assert delivered.status_code == 200, delivered.text

    # DELIVERED has no outgoing transitions.
    regress = client.post(
        f"/api/admin/orders/{order_id}/status",
        headers=_admin_headers(client),
        json={"status": "PENDING"},
    )
    assert regress.status_code == 400, regress.text
