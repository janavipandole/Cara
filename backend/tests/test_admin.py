"""
Tests for Admin Analytics API endpoints.

Covers:
  - Role enforcement (regular user gets 403, admin gets 200)
  - GET /api/admin/analytics/summary returns total_revenue, total_orders, total_customers
  - GET /api/admin/analytics/category-sales returns list of CategorySalesOut
  - GET /api/admin/analytics/order-status-distribution returns list of StatusDistributionOut
"""
import pytest
from fastapi.testclient import TestClient
from app import models


def _register_and_login(client: TestClient, role: str, suffix: str) -> None:
    # Register
    client.post(
        "/api/auth/register",
        json={
            "username": f"admin_t_{suffix}",
            "email": f"admin_t_{suffix}@test.com",
            "password": "Password1@",
        },
    )
    # Perform login to establish credentials cookie
    client.post(
        "/api/auth/login",
        json={
            "email": f"admin_t_{suffix}@test.com",
            "password": "Password1@",
        },
    )


@pytest.fixture
def make_admin(db_session):
    """Mutate a user's role to ADMIN in the DB."""
    def _mutate(email: str):
        user = db_session.query(models.User).filter(models.User.email == email).first()
        if user:
            user.role = "ADMIN"
            db_session.commit()
    return _mutate


class TestAdminSecurity:
    def test_regular_user_access_forbidden(self, client: TestClient):
        """A user with role 'USER' should be denied access (403)."""
        _register_and_login(client, "USER", "regular")
        resp = client.get("/api/admin/analytics/summary")
        assert resp.status_code == 403

    def test_unauthenticated_access_unauthorized(self, client: TestClient):
        """Unauthenticated requests must get 401."""
        client.cookies.clear()
        resp = client.get("/api/admin/analytics/summary")
        assert resp.status_code == 401


class TestAdminAnalytics:
    @pytest.mark.usefixtures("setup_database")
    def test_admin_analytics_summary(self, client: TestClient, db_session, make_admin):
        """Admin user can successfully fetch summary statistics."""
        email = "admin_t_super@test.com"
        _register_and_login(client, "USER", "super")
        make_admin(email)

        resp = client.get("/api/admin/analytics/summary")
        assert resp.status_code == 200
        body = resp.json()
        assert "total_revenue" in body
        assert "total_orders" in body
        assert "total_customers" in body

    def test_admin_category_sales(self, client: TestClient, db_session, make_admin):
        """Admin can fetch sales grouped by product category."""
        email = "admin_t_sales@test.com"
        _register_and_login(client, "USER", "sales")
        make_admin(email)

        resp = client.get("/api/admin/analytics/category-sales")
        assert resp.status_code == 200
        body = resp.json()
        assert isinstance(body, list)

    def test_admin_status_distribution(self, client: TestClient, db_session, make_admin):
        """Admin can fetch status distribution stats."""
        email = "admin_t_dist@test.com"
        _register_and_login(client, "USER", "dist")
        make_admin(email)

        resp = client.get("/api/admin/analytics/order-status-distribution")
        assert resp.status_code == 200
        body = resp.json()
        assert isinstance(body, list)
