"""
Tests for GET /api/products/search/predictive (#6295).

Covers:
  - Literal /search/predictive is not shadowed by /{product_id}
  - Returns ranked suggestions (exact name match beats substring match)
  - Rating tiebreak prefers the higher-rated match
  - limit caps the number of suggestions
  - Empty/missing query returns no suggestions
"""
from app.models import Product
from tests.conftest import TestingSessionLocal

PREDICTIVE_URL = "/api/products/search/predictive"


def _seed(name, brand="SeedBrand", rating=4, price=999.0):
    db = TestingSessionLocal()
    p = Product(
        brand=brand,
        name=name,
        price=price,
        img="img.jpg",
        rating=rating,
        category="minimal",
        subcategory="top",
        color="blue",
        style="casual",
        stock=10,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    pid = p.id
    db.close()
    return pid


def test_predictive_route_not_shadowed_by_product_id_route(client):
    """Literal /search/predictive must resolve (not 422 int validation)."""
    resp = client.get(PREDICTIVE_URL + "?q=shirt")
    assert resp.status_code == 200
    body = resp.json()
    assert "query" in body
    assert "suggestions" in body
    assert "detail" not in body or not isinstance(body.get("detail"), list)


def test_exact_name_match_ranks_highest(client):
    _seed("Classic Tee", rating=3)
    _seed("Classic Tee Pro", rating=5)
    resp = client.get(PREDICTIVE_URL + "?q=classic tee")
    assert resp.status_code == 200
    names = [s["name"] for s in resp.json()["suggestions"]]
    # Exact name match ("Classic Tee") must outrank the substring match.
    assert names[0] == "Classic Tee"


def test_rating_breaks_ties(client):
    _seed("Denim Jacket A", rating=3)
    _seed("Denim Jacket B", rating=5)
    resp = client.get(PREDICTIVE_URL + "?q=denim")
    assert resp.status_code == 200
    names = [s["name"] for s in resp.json()["suggestions"]]
    assert names[0] == "Denim Jacket B"
    assert names[1] == "Denim Jacket A"


def test_limit_caps_suggestions(client):
    for i in range(6):
        _seed(f"Cotton Shirt {i}")
    resp = client.get(PREDICTIVE_URL + "?q=cotton&limit=2")
    assert resp.status_code == 200
    suggestions = resp.json()["suggestions"]
    assert len(suggestions) == 2


def test_empty_query_returns_no_suggestions(client):
    resp = client.get(PREDICTIVE_URL)
    assert resp.status_code == 200
    body = resp.json()
    assert body["query"] == ""
    assert body["suggestions"] == []


def test_no_match_returns_empty_suggestions(client):
    resp = client.get(PREDICTIVE_URL + "?q=zzzzznomatch")
    assert resp.status_code == 200
    assert resp.json()["suggestions"] == []


def test_suggestion_shape(client):
    pid = _seed("Predictive Shape Tee", rating=4, price=1299.0)
    resp = client.get(PREDICTIVE_URL + "?q=predictive shape")
    suggestions = resp.json()["suggestions"]
    assert len(suggestions) >= 1
    first = suggestions[0]
    assert first["id"] == pid
    for key in ("name", "brand", "price", "img", "rating", "category"):
        assert key in first
