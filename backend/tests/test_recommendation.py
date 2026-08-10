"""Tests for POST /api/outfit/recommend and POST /api/outfit/feedback."""
import numpy as np

from app.models import Product
from app.api import admin_products
from app.vector_search import faiss_index
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


def test_recommend_missing_product_id(client):
    r = client.post(RECOMMEND_URL, json={})
    assert r.status_code == 422


def test_feedback_missing_user_id(client):
    db = TestingSessionLocal()
    p = _seed_product(db)
    db.close()

    r = client.post(FEEDBACK_URL, json={
        "product_id": p.id,
        "interaction_type": "view",
    })
    assert r.status_code == 422


def test_feedback_empty_body(client):
    r = client.post(FEEDBACK_URL, json={})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# FAISS index sync
# ---------------------------------------------------------------------------

def _fake_embedding_for_product(product):
    """Deterministic, network-free embedding for tests."""
    rng = np.random.RandomState(product.id)
    emb = rng.rand(faiss_index.EMBEDDING_DIM).astype('float32')
    return emb / np.linalg.norm(emb)


def _rebuild_with_fakes(monkeypatch, tmp_path):
    monkeypatch.setattr(faiss_index, "index_path", str(tmp_path / "faiss_index.bin"))
    monkeypatch.setattr(faiss_index, "embeddings_path", str(tmp_path / "faiss_embeddings.npz"))
    monkeypatch.setattr(faiss_index, "_embedding_for_product", _fake_embedding_for_product)
    monkeypatch.setattr(faiss_index, "_load_clip", lambda: (None, None))


def test_query_embedding_resolves_by_id_not_position(monkeypatch):
    """Non-contiguous product ids must resolve to the right embedding (no positional reconstruct)."""
    # Ids are deliberately sparse (as after deletions); embeddings differ per position.
    ids = np.array([100, 5, 42], dtype='int64')
    embs = np.zeros((3, faiss_index.EMBEDDING_DIM), dtype='float32')
    embs[0][:] = 1.0
    embs[1][:] = 2.0
    embs[2][:] = 3.0
    monkeypatch.setattr(faiss_index, "embedding_ids", ids)
    monkeypatch.setattr(faiss_index, "embeddings", embs)

    # Product 5 lives at position 1; a positional lookup (position 5) would be wrong.
    q = faiss_index._query_embedding(5)
    assert q is not None
    assert q[0] == 2.0

    # Unknown product ids return None instead of a fabricated vector.
    assert faiss_index._query_embedding(999) is None


def test_rebuild_index_tracks_catalog(monkeypatch, tmp_path):
    _rebuild_with_fakes(monkeypatch, tmp_path)

    db = TestingSessionLocal()
    a = _seed_product(db, name="IndexA", stock=1)
    db.close()
    db = TestingSessionLocal()
    b = _seed_product(db, name="IndexB", stock=1)
    db.close()

    db = TestingSessionLocal()
    faiss_index.rebuild_index(db)
    db.close()

    def _ids():
        return {int(i) for i in faiss_index.embedding_ids}

    assert a.id in _ids()
    assert b.id in _ids()

    # A newly created product shows up after the next rebuild.
    db = TestingSessionLocal()
    c = _seed_product(db, name="IndexC", stock=1)
    db.close()
    db = TestingSessionLocal()
    faiss_index.rebuild_index(db)
    db.close()
    assert c.id in _ids()

    # A deleted product is removed from the index after the next rebuild.
    db = TestingSessionLocal()
    db.query(Product).filter(Product.id == a.id).delete()
    db.commit()
    db.close()
    db = TestingSessionLocal()
    faiss_index.rebuild_index(db)
    db.close()
    assert a.id not in _ids()


def test_admin_product_crud_triggers_rebuild(client, monkeypatch, tmp_path, admin_auth_headers):
    _rebuild_with_fakes(monkeypatch, tmp_path)
    calls = []
    monkeypatch.setattr(admin_products, "rebuild_index", lambda db: calls.append(db))

    payload = {
        "brand": "CRUDBrand",
        "name": "CRUD Rebuild Shirt",
        "price": 49.99,
        "img": "images/products/crud-shirt.jpg",
        "rating": 4,
        "category": "minimal",
        "subcategory": "top",
        "color": "black",
        "style": "casual",
        "stock": 5,
    }

    created = client.post("/api/admin/products/", headers=admin_auth_headers, json=payload)
    assert created.status_code == 201, created.text
    product_id = created.json()["id"]
    assert len(calls) == 1

    updated = client.put(
        f"/api/admin/products/{product_id}",
        headers=admin_auth_headers,
        json={**payload, "name": "CRUD Rebuild Renamed", "price": 39.99},
    )
    assert updated.status_code == 200, updated.text
    assert len(calls) == 2

    deleted = client.delete(f"/api/admin/products/{product_id}", headers=admin_auth_headers)
    assert deleted.status_code == 200, deleted.text
    assert len(calls) == 3
