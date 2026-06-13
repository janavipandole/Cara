"""Tests for GET /api/products/ and GET /api/products/{id}."""
from app.models import Product
from app.database import get_db
from tests.conftest import override_get_db, TestingSessionLocal

PRODUCTS_URL = "/api/products/"


def _seed_product(db, **kwargs) -> Product:
    defaults = dict(
        brand="TestBrand", name="Test Shirt", price=29.99,
        img="img.jpg", rating=4, category="minimal",
        subcategory="top", color="white", style="casual",
    )
    defaults.update(kwargs)
    p = Product(**defaults)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def test_get_products_empty(client):
    r = client.get(PRODUCTS_URL)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_get_products_returns_seeded(client):
    db = TestingSessionLocal()
    p = _seed_product(db)
    db.close()

    r = client.get(PRODUCTS_URL)
    assert r.status_code == 200
    ids = [item["id"] for item in r.json()]
    assert p.id in ids


def test_get_product_by_id(client):
    db = TestingSessionLocal()
    p = _seed_product(db, name="Specific Shirt")
    db.close()

    r = client.get(f"{PRODUCTS_URL}{p.id}")
    assert r.status_code == 200
    assert r.json()["name"] == "Specific Shirt"


def test_get_product_not_found(client):
    r = client.get(f"{PRODUCTS_URL}999999")
    assert r.status_code == 404
