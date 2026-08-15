"""Public product/search endpoints: rate limits + LIKE wildcard escaping.

Regression tests for https://github.com/janavipandole/Cara/issues/6066.
"""
from app.limiter import limiter
from app.models import Product
from tests.conftest import TestingSessionLocal

SEARCH_URL = "/api/products/search/query"
PRODUCTS_URL = "/api/products/"
CATEGORIES_URL = "/api/products/search/categories"


def _seed_product(name):
    db = TestingSessionLocal()
    p = Product(
        brand="EscBrand",
        name=name,
        price=25.0,
        img="esc.jpg",
        rating=4,
        category="minimal",
        subcategory="top",
        color="white",
        style="casual",
        stock=10,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    db.close()
    return p.id


def test_search_escapes_percent_wildcard(client):
    ids = [_seed_product("Esc 100% Tee"), _seed_product("Esc Plain Tee"), _seed_product("Esc under_score Tee")]

    # A bare '%' must match the literal percent product only, not the catalog.
    r = client.get(SEARCH_URL, params={"q": "%"})
    assert r.status_code == 200
    found = [p["id"] for p in r.json()["products"] if p["id"] in ids]
    assert found == [ids[0]]

    # '_' must match the literal underscore product only.
    r = client.get(SEARCH_URL, params={"q": "_"})
    assert r.status_code == 200
    found = [p["id"] for p in r.json()["products"] if p["id"] in ids]
    assert found == [ids[2]]

    # '100%' matches the literal sequence, not '100' alone.
    r = client.get(SEARCH_URL, params={"q": "100%"})
    assert r.status_code == 200
    found = [p["id"] for p in r.json()["products"] if p["id"] in ids]
    assert found == [ids[0]]


def test_search_plain_keyword_still_works(client):
    ids = [_seed_product("Esc 100% Tee"), _seed_product("Esc Plain Tee")]

    r = client.get(SEARCH_URL, params={"q": "Plain"})
    assert r.status_code == 200
    found = [p["id"] for p in r.json()["products"] if p["id"] in ids]
    assert found == [ids[1]]


def test_product_endpoints_rate_limited(client):
    _seed_product("Rate Limited Tee")

    limiter.enabled = True
    try:
        for _ in range(60):
            r = client.get(PRODUCTS_URL)
            assert r.status_code == 200, r.text
        r = client.get(PRODUCTS_URL)
        assert r.status_code == 429
    finally:
        limiter.enabled = False


def test_search_endpoint_rate_limited(client):
    _seed_product("Rate Limited Search Tee")

    limiter.enabled = True
    try:
        for _ in range(30):
            r = client.get(SEARCH_URL, params={"q": "rate"})
            assert r.status_code == 200, r.text
        r = client.get(SEARCH_URL, params={"q": "rate"})
        assert r.status_code == 429
    finally:
        limiter.enabled = False


def test_category_endpoint_rate_limited(client):
    _seed_product("Rate Limited Category Tee")

    limiter.enabled = True
    try:
        for _ in range(60):
            r = client.get(CATEGORIES_URL)
            assert r.status_code == 200, r.text
        r = client.get(CATEGORIES_URL)
        assert r.status_code == 429
    finally:
        limiter.enabled = False
