"""
Tests for order history and order detail endpoints.

Covers:
  - POST /api/orders/  — order creation stores user_id and writes initial status event
  - GET  /api/orders/my-orders — paginated list returns only the authed user's orders
  - GET  /api/orders/{id} — returns full detail including items and status_history
  - GET  /api/orders/{id} — 404 when order belongs to a different user
  - GET  /api/orders/my-orders?status=CONFIRMED — status filter works correctly
"""
import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _register_and_login(client: TestClient, suffix: str) -> str:
    """Register a new user and return a session cookie jar (via client)."""
    client.post(
        "/api/auth/register",
        json={
            "username": f"orderuser_{suffix}",
            "email": f"orderuser_{suffix}@test.com",
            "password": "Password1@",
        },
    )
    resp = client.post(
        "/api/auth/login",
        json={
            "email": f"orderuser_{suffix}@test.com",
            "password": "Password1@",
        },
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.cookies.get("access_token", "")


def _seed_product(client: TestClient) -> dict:
    """Return an existing product from the catalog so order tests are self-contained."""
    resp = client.get("/api/products/?limit=1")
    assert resp.status_code == 200
    products = resp.json()
    if products:
        return products[0]
    pytest.skip("No products in test database — seed products first.")


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestOrderCreation:
    def test_create_order_authenticated(self, client: TestClient):
        """Authenticated user can place an order and receives order_id."""
        _register_and_login(client, "create")
        product = _seed_product(client)

        resp = client.post(
            "/api/orders/",
            json={
                "fullName": "Test Buyer",
                "email": "orderuser_create@test.com",
                "address": "123 Main St",
                "city": "Mumbai",
                "zip": "400001",
                "items": [{"product_name": product["name"], "quantity": 1}],
            },
        )
        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert "order_id" in data
        assert isinstance(data["order_id"], int)

    def test_create_order_unauthenticated_rejected(self, client: TestClient):
        """Unauthenticated requests to place an order must return 401."""
        client.cookies.clear()
        resp = client.post(
            "/api/orders/",
            json={
                "fullName": "Ghost",
                "email": "ghost@test.com",
                "address": "Nowhere",
                "city": "Nowhere",
                "zip": "000000",
                "items": [],
            },
        )
        assert resp.status_code == 401


class TestOrderHistory:
    def test_list_my_orders_returns_paginated_response(self, client: TestClient):
        """GET /api/orders/my-orders returns total, page, page_size and orders list."""
        _register_and_login(client, "hist")
        resp = client.get("/api/orders/my-orders")
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert "total" in body
        assert "page" in body
        assert "page_size" in body
        assert "orders" in body
        assert isinstance(body["orders"], list)

    def test_list_my_orders_does_not_expose_other_users_orders(self, client: TestClient):
        """Orders of user A must not appear in user B's history."""
        # User A places an order
        _register_and_login(client, "userA")
        product = _seed_product(client)
        client.post(
            "/api/orders/",
            json={
                "fullName": "User A",
                "email": "orderuser_userA@test.com",
                "address": "A Street",
                "city": "Delhi",
                "zip": "110001",
                "items": [{"product_name": product["name"], "quantity": 1}],
            },
        )

        # User B logs in and checks their history
        _register_and_login(client, "userB")
        resp = client.get("/api/orders/my-orders")
        assert resp.status_code == 200
        body = resp.json()
        # User B should see zero orders (they just registered)
        for order in body["orders"]:
            assert order["email"] == "orderuser_userB@test.com"

    def test_status_filter(self, client: TestClient):
        """Status filter returns only orders matching the requested status."""
        _register_and_login(client, "filter")
        resp = client.get("/api/orders/my-orders?status=CONFIRMED")
        assert resp.status_code == 200
        body = resp.json()
        for order in body["orders"]:
            assert order["status"] == "CONFIRMED"

    def test_pagination_params(self, client: TestClient):
        """page and page_size query params are reflected in the response."""
        _register_and_login(client, "page")
        resp = client.get("/api/orders/my-orders?page=1&page_size=5")
        assert resp.status_code == 200
        body = resp.json()
        assert body["page"] == 1
        assert body["page_size"] == 5


class TestOrderDetail:
    def test_order_detail_includes_items_and_history(self, client: TestClient):
        """GET /api/orders/{id} returns items[] and status_history[]."""
        _register_and_login(client, "detail")
        product = _seed_product(client)
        create_resp = client.post(
            "/api/orders/",
            json={
                "fullName": "Detail User",
                "email": "orderuser_detail@test.com",
                "address": "Detail St",
                "city": "Pune",
                "zip": "411001",
                "items": [{"product_name": product["name"], "quantity": 1}],
            },
        )
        assert create_resp.status_code == 201
        order_id = create_resp.json()["order_id"]

        detail_resp = client.get(f"/api/orders/{order_id}")
        assert detail_resp.status_code == 200
        body = detail_resp.json()
        assert body["id"] == order_id
        assert isinstance(body["items"], list)
        assert len(body["items"]) >= 1
        assert isinstance(body["status_history"], list)
        assert len(body["status_history"]) >= 1
        assert body["status_history"][0]["status"] == "CONFIRMED"

    def test_order_detail_cross_user_returns_404(self, client: TestClient):
        """A user cannot fetch another user's order by ID — must get 404."""
        # Owner places an order
        _register_and_login(client, "owner")
        product = _seed_product(client)
        create_resp = client.post(
            "/api/orders/",
            json={
                "fullName": "Owner",
                "email": "orderuser_owner@test.com",
                "address": "Owner Rd",
                "city": "Chennai",
                "zip": "600001",
                "items": [{"product_name": product["name"], "quantity": 1}],
            },
        )
        assert create_resp.status_code == 201
        order_id = create_resp.json()["order_id"]

        # Attacker tries to access owner's order
        _register_and_login(client, "attacker")
        resp = client.get(f"/api/orders/{order_id}")
        assert resp.status_code == 404
