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

def test_semantic_search_empty_query(client):
    r = client.get(f"{PRODUCTS_URL}search?q=")

    assert r.status_code == 400
    assert r.json()["detail"] == "Search query cannot be empty"


def test_semantic_search_invalid_top_k(client):
    r = client.get(f"{PRODUCTS_URL}search?q=winter+coat&top_k=0")

    assert r.status_code == 400
    assert r.json()["detail"] == "top_k must be between 1 and 50"


def test_semantic_search_top_k_above_limit(client):
    r = client.get(f"{PRODUCTS_URL}search?q=winter+coat&top_k=51")

    assert r.status_code == 400
    assert r.json()["detail"] == "top_k must be between 1 and 50"


def test_semantic_search_returns_products(client, monkeypatch):
    db = TestingSessionLocal()

    product = _seed_product(
        db,
        name="Warm Winter Jacket",
        category="formal",
        style="winter",
    )

    db.close()

    monkeypatch.setattr(
        "app.api.products.search_products",
        lambda query, top_k: [
            {
                "product_id": product.id,
                "distance": 0.123,
            }
        ],
    )

    r = client.get(
        f"{PRODUCTS_URL}search?q=warm+winter+coat&top_k=5"
    )

    assert r.status_code == 200

    data = r.json()

    assert len(data) == 1
    assert data[0]["product"]["id"] == product.id
    assert data[0]["product"]["name"] == "Warm Winter Jacket"
    assert data[0]["distance"] == 0.123


def test_semantic_search_returns_empty_when_no_matches(
    client,
    monkeypatch,
):
    monkeypatch.setattr(
        "app.api.products.search_products",
        lambda query, top_k: [],
    )

    r = client.get(
        f"{PRODUCTS_URL}search?q=nonexistent+product"
    )

    assert r.status_code == 200
    assert r.json() == []