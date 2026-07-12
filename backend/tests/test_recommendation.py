"""Tests for POST /api/outfit/recommend and POST /api/outfit/feedback."""
from app.models import Product
from tests.conftest import TestingSessionLocal

RECOMMEND_URL = "/api/outfit/recommend"
FEEDBACK_URL = "/api/outfit/feedback"


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


# ---------------------------------------------------------------------------
# /feedback
# ---------------------------------------------------------------------------

def test_feedback_success(client):
    db = TestingSessionLocal()
    p = _seed_product(db)
    db.close()

    r = client.post(FEEDBACK_URL, json={
        "user_id": "anon-123",
        "product_id": p.id,
        "interaction_type": "view",
    })
    assert r.status_code == 200
    assert r.json()["status"] == "success"


def test_feedback_all_interaction_types(client):
    db = TestingSessionLocal()
    p = _seed_product(db)
    db.close()

    for itype in ("view", "click", "wishlist", "cart", "buy"):
        r = client.post(FEEDBACK_URL, json={
            "user_id": "anon-test",
            "product_id": p.id,
            "interaction_type": itype,
        })
        assert r.status_code == 200, f"Failed for interaction_type={itype}"


def test_feedback_invalid_product(client):
    r = client.post(FEEDBACK_URL, json={
        "user_id": "anon-123",
        "product_id": 999999,
        "interaction_type": "view",
    })
    assert r.status_code == 404


def test_feedback_invalid_interaction_type(client):
    db = TestingSessionLocal()
    p = _seed_product(db)
    db.close()

    r = client.post(FEEDBACK_URL, json={
        "user_id": "anon-123",
        "product_id": p.id,
        "interaction_type": "invalid_type",
    })
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# /recommend
# ---------------------------------------------------------------------------

def test_recommend_invalid_product(client):
    r = client.post(RECOMMEND_URL, json={"product_id": 999999})
    assert r.status_code == 404


def test_recommend_limit_bounds(client):
    db = TestingSessionLocal()
    p = _seed_product(db)
    db.close()

    # limit=0 should fail (ge=1 constraint in schema)
    r = client.post(RECOMMEND_URL, json={"product_id": p.id, "limit": 0})
    assert r.status_code == 422

    # limit=51 should fail (le=50 constraint in schema)
    r = client.post(RECOMMEND_URL, json={"product_id": p.id, "limit": 51})
    assert r.status_code == 422
