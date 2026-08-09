"""Admin product API tests."""
from passlib.context import CryptContext

from app.models import User
from tests.conftest import TestingSessionLocal, bearer_token

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _admin_headers(client):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "admin-products@example.com").first()
    if user is None:
        user = User(
            username="adminproducts",
            email="admin-products@example.com",
            hashed_password=pwd.hash("Admin@1234"),
            role="ADMIN",
        )
        db.add(user)
        db.commit()
    db.close()

    response = client.post(
        "/api/auth/login",
        json={"email": "admin-products@example.com", "password": "Admin@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": bearer_token(client)}


def _user_headers(client):
    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "user-products@example.com").first()
    if user is None:
        user = User(
            username="userproducts",
            email="user-products@example.com",
            hashed_password=pwd.hash("Test@1234"),
        )
        db.add(user)
        db.commit()
    db.close()

    response = client.post(
        "/api/auth/login",
        json={"email": "user-products@example.com", "password": "Test@1234"},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": bearer_token(client)}


def test_admin_create_product(client):
    headers = _admin_headers(client)
    response = client.post(
        "/api/admin/products/",
        json={
            "brand": "Test Brand",
            "name": "Admin Created Product",
            "price": 49.99,
            "img": "test.jpg",
            "rating": 4,
            "category": "street",
            "stock": 25,
        },
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Admin Created Product"
    assert data["price"] == 49.99
    assert isinstance(data["id"], int)
    assert data["id"] > 0


def test_admin_create_ignores_client_supplied_id(client):
    headers = _admin_headers(client)
    response = client.post(
        "/api/admin/products/",
        json={
            "id": 999,
            "brand": "Test Brand",
            "name": "Client Id Product",
            "price": 10.0,
            "img": "test.jpg",
            "rating": 3,
            "category": "street",
            "stock": 5,
        },
        headers=headers,
    )
    assert response.status_code == 201
    assert response.json()["id"] != 999


def test_admin_create_duplicate_product(client):
    headers = _admin_headers(client)
    payload = {
        "brand": "Brand",
        "name": "Dup Product Unique",
        "price": 20.0,
        "img": "test.jpg",
        "rating": 3,
        "category": "minimal",
        "stock": 10,
    }
    assert client.post("/api/admin/products/", json=payload, headers=headers).status_code == 201
    response = client.post("/api/admin/products/", json=payload, headers=headers)
    assert response.status_code == 409


def test_non_admin_cannot_create(client):
    headers = _user_headers(client)
    response = client.post(
        "/api/admin/products/",
        json={
            "brand": "B",
            "name": "Unauthorized Product",
            "price": 1.0,
            "img": "x.jpg",
            "rating": 1,
            "category": "street",
            "stock": 1,
        },
        headers=headers,
    )
    assert response.status_code == 403


def test_admin_delete_nonexistent_product(client):
    headers = _admin_headers(client)
    response = client.delete("/api/admin/products/9999", headers=headers)
    assert response.status_code == 404


def test_admin_update_stock_invalid(client):
    headers = _admin_headers(client)
    response = client.patch(
        "/api/admin/products/9999/stock?stock=50",
        headers=headers,
    )
    assert response.status_code == 404


def test_admin_update_rejects_duplicate_name(client):
    headers = _admin_headers(client)
    first = {
        "brand": "Brand",
        "name": "Unique Name Alpha",
        "price": 20.0,
        "img": "a.jpg",
        "rating": 3,
        "category": "minimal",
        "stock": 10,
    }
    second = {
        "brand": "Brand",
        "name": "Unique Name Beta",
        "price": 22.0,
        "img": "b.jpg",
        "rating": 3,
        "category": "minimal",
        "stock": 10,
    }
    a = client.post("/api/admin/products/", json=first, headers=headers)
    b = client.post("/api/admin/products/", json=second, headers=headers)
    assert a.status_code == 201
    assert b.status_code == 201
    alpha_id = a.json()["id"]

    response = client.put(
        f"/api/admin/products/{alpha_id}",
        json={**first, "name": "Unique Name Beta"},
        headers=headers,
    )
    assert response.status_code == 409
