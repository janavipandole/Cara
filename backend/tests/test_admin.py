"""
Tests for Admin Analytics API endpoints.

Covers:
  - Role enforcement (regular user gets 403, admin gets 200)
  - GET /api/admin/analytics/summary returns total_revenue, total_orders, total_customers
  - GET /api/admin/analytics/category-sales returns list of CategorySalesOut
  - GET /api/admin/analytics/order-status-distribution returns list of StatusDistributionOut
  - Cancelled orders are excluded from revenue/order-volume/category-sales aggregates
  - Orphaned order items (renamed/deleted products) are bucketed as "Unknown" instead of dropped
"""
import pytest
from fastapi.testclient import TestClient
from app import models

from tests.conftest import TestingSessionLocal


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


def _seed_product(db, **kwargs) -> models.Product:
    defaults = dict(
        brand="TestBrand",
        name="Analytics Shirt",
        price=100.0,
        img="img.jpg",
        rating=4,
        category="minimal",
        subcategory="top",
        color="white",
        style="casual",
        stock=10,
    )
    defaults.update(kwargs)
    product = models.Product(**defaults)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def _create_order(client, headers, items, email="admin_t_orders@test.com", **extra):
    payload = {
        "fullName": "Test User",
        "email": email,
        "address": "1 Test St",
        "city": "Testville",
        "zip": "12345",
        "items": items,
    }
    payload.update(extra)
    resp = client.post("/api/orders/", headers=headers, json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()["order_id"]


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

    def test_unauthenticated_category_sales_unauthorized(self, client: TestClient):
        client.cookies.clear()
        resp = client.get("/api/admin/analytics/category-sales")
        assert resp.status_code == 401

    def test_unauthenticated_status_distribution_unauthorized(self, client: TestClient):
        client.cookies.clear()
        resp = client.get("/api/admin/analytics/order-status-distribution")
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

    def test_cancelled_orders_excluded_from_summary(
        self, client: TestClient, make_admin
    ):
        """Revenue and order volume must not include cancelled orders."""
        db = TestingSessionLocal()
        db.query(models.Order).delete()
        db.commit()
        db.close()

        email = "admin_t_cancel@test.com"
        _register_and_login(client, "USER", "cancel")
        make_admin(email)
        headers = {"Authorization": f"Bearer {client.post('/api/auth/login', json={'email': email, 'password': 'Password1@'}).json()['access_token']}"}

        db = TestingSessionLocal()
        keep = _seed_product(db, name="Keep Shirt", price=100.0, category="summary-keep", stock=10)
        cancel_p = _seed_product(db, name="Cancel Shirt", price=200.0, category="summary-cancel", stock=10)
        keep_id, cancel_id = keep.id, cancel_p.id
        db.close()

        # 2 x 100 = 200 subtotal; 200 + 36 tax + 150 shipping = 386.
        _create_order(client, headers, [{"product_id": keep_id, "quantity": 2}], email=email)
        cancelled = _create_order(client, headers, [{"product_id": cancel_id, "quantity": 1}], email=email)

        cancel_resp = client.post(f"/api/orders/{cancelled}/cancel", headers=headers)
        assert cancel_resp.status_code == 200, cancel_resp.text

        summary = client.get("/api/admin/analytics/summary").json()
        assert summary["total_orders"] == 1
        assert summary["total_revenue"] == 386.0

    def test_cancelled_orders_excluded_from_category_sales(
        self, client: TestClient, make_admin
    ):
        """Category sales must exclude items from cancelled orders."""
        email = "admin_t_catcancel@test.com"
        _register_and_login(client, "USER", "catcancel")
        make_admin(email)
        headers = {"Authorization": f"Bearer {client.post('/api/auth/login', json={'email': email, 'password': 'Password1@'}).json()['access_token']}"}

        db = TestingSessionLocal()
        active = _seed_product(db, name="Active Cat Shirt", price=50.0, category="cat-sales-active", stock=10)
        cancelled_p = _seed_product(db, name="Cancelled Cat Shirt", price=300.0, category="cat-sales-cancelled", stock=10)
        active_id, cancelled_p_id = active.id, cancelled_p.id
        db.close()

        _create_order(client, headers, [{"product_id": active_id, "quantity": 4}], email=email)
        cancelled = _create_order(client, headers, [{"product_id": cancelled_p_id, "quantity": 1}], email=email)

        cancel_resp = client.post(f"/api/orders/{cancelled}/cancel", headers=headers)
        assert cancel_resp.status_code == 200, cancel_resp.text

        sales = client.get("/api/admin/analytics/category-sales").json()
        by_category = {row["category"]: row for row in sales}
        assert by_category["cat-sales-active"]["units_sold"] == 4
        assert by_category["cat-sales-active"]["revenue"] == 200.0
        assert "cat-sales-cancelled" not in by_category

    def test_deleted_product_sales_bucketed_as_unknown(
        self, client: TestClient, make_admin
    ):
        """Orphaned items must appear under 'Unknown' instead of being dropped."""
        email = "admin_t_orphan@test.com"
        _register_and_login(client, "USER", "orphan")
        make_admin(email)
        headers = {"Authorization": f"Bearer {client.post('/api/auth/login', json={'email': email, 'password': 'Password1@'}).json()['access_token']}"}

        db = TestingSessionLocal()
        product = _seed_product(db, name="Doomed Shirt", price=75.0, category="cat-sales-orphan", stock=10)
        product_id = product.id
        db.close()

        _create_order(client, headers, [{"product_id": product_id, "quantity": 3}], email=email)

        # Simulate an orphaned line item: clear the FK, then remove the product.
        # (SQLite may recycle primary keys; leaving a dangling id would reattach
        # historical units to a later product with the same id.)
        db = TestingSessionLocal()
        db.query(models.OrderItem).filter(
            models.OrderItem.product_id == product_id
        ).update({models.OrderItem.product_id: None})
        db.query(models.Product).filter(models.Product.id == product_id).delete()
        db.commit()
        db.close()

        sales = client.get("/api/admin/analytics/category-sales").json()
        by_category = {row["category"]: row for row in sales}
        assert "cat-sales-orphan" not in by_category
        assert by_category["Unknown"]["units_sold"] == 3
        assert by_category["Unknown"]["revenue"] == 225.0

    def test_renamed_product_sales_stay_on_category_via_product_id(
        self, client: TestClient, make_admin
    ):
        """Renaming a product must not move sales to Unknown when product_id is set."""
        import uuid

        email = "admin_t_rename@test.com"
        _register_and_login(client, "USER", "rename")
        make_admin(email)
        category = f"cat-sales-rename-{uuid.uuid4().hex[:8]}"

        db = TestingSessionLocal()
        product = _seed_product(
            db, name="Rename Me Shirt", price=40.0, category=category, stock=10
        )
        product_id = product.id
        db.close()

        create = client.post(
            "/api/orders/",
            json={
                "fullName": "Test User",
                "email": email,
                "address": "1 Test St",
                "city": "Testville",
                "zip": "12345",
                "items": [{"product_id": product_id, "quantity": 2}],
            },
        )
        assert create.status_code == 201, create.text

        db = TestingSessionLocal()
        row = db.query(models.Product).filter(models.Product.id == product_id).first()
        row.name = "Renamed Shirt"
        db.commit()
        db.close()

        sales = client.get("/api/admin/analytics/category-sales").json()
        by_category = {row["category"]: row for row in sales}
        assert by_category[category]["units_sold"] == 2
        assert by_category[category]["revenue"] == 80.0

