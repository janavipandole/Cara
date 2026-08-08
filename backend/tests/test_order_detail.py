"""Tests for GET /api/orders/{id}."""
from passlib.context import CryptContext

from app.models import Order, OrderItem, User
from tests.conftest import TestingSessionLocal

ORDERS_URL = "/api/orders/"
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _bearer_from_cookies(client):
    """Build Authorization from the access_token cookie set by login/register."""
    cookie = client.cookies.get("access_token")
    assert cookie, "expected access_token cookie after login"
    cookie = str(cookie).strip().strip('"')
    if cookie.startswith("Bearer "):
        return {"Authorization": cookie}
    return {"Authorization": f"Bearer {cookie}"}



def _auth_headers(client, *, username="detailuser", email="detail@example.com"):
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
    return _bearer_from_cookies(client)


def _seed_order(*, email: str, product_name: str = "Detail Shirt", product_id: int | None = None) -> Order:
    db = TestingSessionLocal()
    order = Order(
        full_name="Detail User",
        email=email,
        address="1 Detail St",
        city="Detail City",
        zip_code="99999",
        total_amount=120.0,
        status="CONFIRMED",
    )
    db.add(order)
    db.flush()
    db.add(
        OrderItem(
            order_id=order.id,
            product_id=product_id,
            product_name=product_name,
            quantity=2,
            price=60.0,
        )
    )
    db.commit()
    db.refresh(order)
    order_id = order.id
    db.close()
    return order_id


def test_get_order_detail_returns_items_for_owner(client):
    headers = _auth_headers(client)
    order_id = _seed_order(email="detail@example.com", product_id=42)

    response = client.get(f"{ORDERS_URL}{order_id}", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["id"] == order_id
    assert data["email"] == "detail@example.com"
    assert len(data["items"]) == 1
    assert data["items"][0]["product_name"] == "Detail Shirt"
    assert data["items"][0]["product_id"] == 42
    assert data["items"][0]["quantity"] == 2


def test_get_order_detail_forbidden_for_other_user(client):
    _auth_headers(client, username="owneruser", email="owner@example.com")
    order_id = _seed_order(email="owner@example.com", product_name="Owner Shirt")

    other_headers = _auth_headers(
        client, username="otheruser", email="other@example.com"
    )
    response = client.get(f"{ORDERS_URL}{order_id}", headers=other_headers)
    assert response.status_code == 404


def test_get_order_detail_requires_auth(client):
    order_id = _seed_order(email="anon@example.com")
    response = client.get(f"{ORDERS_URL}{order_id}")
    assert response.status_code == 401
