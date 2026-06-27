"""
Tests for the server-side wishlist API.

Covers:
  - GET  /api/wishlist/         — returns paginated list for authenticated user
  - POST /api/wishlist/{id}     — adds product when not in wishlist
  - POST /api/wishlist/{id}     — removes product when already in wishlist (toggle)
  - DELETE /api/wishlist/{id}   — removes product idempotently
  - GET  /api/wishlist/check/{id} — returns correct in_wishlist boolean
  - All endpoints require authentication (401 when unauthenticated)
  - Products of user A are not visible to user B
"""
import pytest
from fastapi.testclient import TestClient


# ── Helpers ───────────────────────────────────────────────────────────────────

def _auth(client: TestClient, suffix: str) -> None:
    """Register and log in a fresh user; session cookie is set automatically."""
    client.post(
        "/api/auth/register",
        json={
            "username": f"wishuser_{suffix}",
            "email": f"wishuser_{suffix}@test.com",
            "password": "Password1@",
        },
    )
    client.post(
        "/api/auth/login",
        json={"email": f"wishuser_{suffix}@test.com", "password": "Password1@"},
    )


def _first_product_id(client: TestClient) -> int:
    resp = client.get("/api/products/?limit=1")
    products = resp.json()
    if not products:
        pytest.skip("No products seeded in test DB.")
    return products[0]["id"]


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestWishlistAuth:
    def test_list_requires_auth(self, client: TestClient):
        client.cookies.clear()
        resp = client.get("/api/wishlist/")
        assert resp.status_code == 401

    def test_toggle_requires_auth(self, client: TestClient):
        client.cookies.clear()
        resp = client.post("/api/wishlist/1")
        assert resp.status_code == 401

    def test_delete_requires_auth(self, client: TestClient):
        client.cookies.clear()
        resp = client.delete("/api/wishlist/1")
        assert resp.status_code == 401

    def test_check_requires_auth(self, client: TestClient):
        client.cookies.clear()
        resp = client.get("/api/wishlist/check/1")
        assert resp.status_code == 401


class TestWishlistCRUD:
    def test_empty_wishlist_on_fresh_account(self, client: TestClient):
        _auth(client, "empty")
        resp = client.get("/api/wishlist/")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] == 0
        assert body["items"] == []

    def test_toggle_adds_product(self, client: TestClient):
        _auth(client, "add")
        pid = _first_product_id(client)
        resp = client.post(f"/api/wishlist/{pid}")
        assert resp.status_code == 200
        body = resp.json()
        assert body["action"] == "added"
        assert body["in_wishlist"] is True
        assert body["product_id"] == pid

    def test_toggle_removes_product_on_second_call(self, client: TestClient):
        _auth(client, "toggle")
        pid = _first_product_id(client)
        client.post(f"/api/wishlist/{pid}")          # add
        resp = client.post(f"/api/wishlist/{pid}")   # remove
        assert resp.status_code == 200
        body = resp.json()
        assert body["action"] == "removed"
        assert body["in_wishlist"] is False

    def test_wishlist_list_after_add(self, client: TestClient):
        _auth(client, "list")
        pid = _first_product_id(client)
        client.post(f"/api/wishlist/{pid}")
        resp = client.get("/api/wishlist/")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] >= 1
        product_ids = [i["product"]["id"] for i in body["items"]]
        assert pid in product_ids

    def test_delete_removes_item(self, client: TestClient):
        _auth(client, "delete")
        pid = _first_product_id(client)
        client.post(f"/api/wishlist/{pid}")
        del_resp = client.delete(f"/api/wishlist/{pid}")
        assert del_resp.status_code == 200
        # Wishlist should now be empty
        list_resp = client.get("/api/wishlist/")
        assert list_resp.json()["total"] == 0

    def test_delete_is_idempotent(self, client: TestClient):
        """Deleting a product not in the wishlist should still return 200."""
        _auth(client, "idem")
        pid = _first_product_id(client)
        resp = client.delete(f"/api/wishlist/{pid}")
        assert resp.status_code == 200

    def test_check_returns_false_when_not_in_wishlist(self, client: TestClient):
        _auth(client, "check_false")
        pid = _first_product_id(client)
        resp = client.get(f"/api/wishlist/check/{pid}")
        assert resp.status_code == 200
        assert resp.json()["in_wishlist"] is False

    def test_check_returns_true_after_add(self, client: TestClient):
        _auth(client, "check_true")
        pid = _first_product_id(client)
        client.post(f"/api/wishlist/{pid}")
        resp = client.get(f"/api/wishlist/check/{pid}")
        assert resp.status_code == 200
        assert resp.json()["in_wishlist"] is True

    def test_nonexistent_product_returns_404(self, client: TestClient):
        _auth(client, "notfound")
        resp = client.post("/api/wishlist/999999")
        assert resp.status_code == 404

    def test_pagination_params_respected(self, client: TestClient):
        _auth(client, "paginate")
        resp = client.get("/api/wishlist/?page=1&page_size=5")
        assert resp.status_code == 200
        body = resp.json()
        assert body["page"] == 1
        assert body["page_size"] == 5

    def test_user_isolation(self, client: TestClient):
        """User A's wishlist should not be visible to User B."""
        _auth(client, "isolate_a")
        pid = _first_product_id(client)
        client.post(f"/api/wishlist/{pid}")

        _auth(client, "isolate_b")
        resp = client.get("/api/wishlist/")
        body = resp.json()
        # User B's wishlist should be empty
        assert body["total"] == 0
