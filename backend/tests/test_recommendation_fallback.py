"""Recommendation fallback + status when the FAISS index is uninitialized.

Regression tests for https://github.com/janavipandole/Cara/issues/6065 —
POST /api/outfit/recommend returned a bare empty list on fresh deployments
where the FAISS artifacts do not exist yet.
"""
from app.models import Product
from app.vector_search import faiss_index
from tests.conftest import TestingSessionLocal

RECOMMEND_URL = "/api/outfit/recommend"
STATUS_URL = "/api/outfit/recommend/status"


def _force_uninitialized(monkeypatch):
    """Simulate a fresh deployment with no FAISS artifacts.

    Other tests (test_recommendation.py) rebuild the shared module-level
    index, so we must explicitly reset it to exercise the fallback path.
    """
    monkeypatch.setattr(faiss_index, "faiss", None)
    monkeypatch.setattr(faiss_index, "index", None)
    monkeypatch.setattr(faiss_index, "embedding_ids", None)
    monkeypatch.setattr(faiss_index, "embeddings", None)


def _seed_products():
    db = TestingSessionLocal()
    products = [
        Product(
            brand="FallbackBrand",
            name=f"Fallback Tee {i}",
            price=50.0 + i,
            img=f"f{i}.jpg",
            rating=rating,
            category="minimal",
            subcategory="top",
            color="white",
            style="casual",
            stock=stock,
        )
        for i, (rating, stock) in enumerate([(5, 10), (4, 10), (3, 0), (4, 10)])
    ]
    db.add_all(products)
    db.commit()
    ids = [p.id for p in products]
    db.close()
    return ids


def test_status_reports_uninitialized_index(client, monkeypatch):
    _force_uninitialized(monkeypatch)
    resp = client.get(STATUS_URL)
    assert resp.status_code == 200
    assert resp.json()["index_initialized"] is False
    assert resp.json()["fallback_enabled"] is True


def test_recommend_falls_back_to_catalog_when_index_missing(client, monkeypatch):
    _force_uninitialized(monkeypatch)
    # ids[0]=rating 5, ids[1]=rating 4, ids[2]=rating 3 (out of stock),
    # ids[3]=rating 4. Base = the rating-5 product.
    ids = _seed_products()
    base_id, four_a, out_of_stock_id, four_b = ids

    resp = client.post(
        RECOMMEND_URL,
        json={"product_id": base_id, "limit": 20},
    )
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) >= 1
    result_ids = [item["id"] for item in results]
    assert base_id not in result_ids
    # Out-of-stock products are excluded by the fallback query.
    assert out_of_stock_id not in result_ids
    # Among the seeded products, the rating-4 in-stock items are present and
    # ordered by (rating desc, id asc): four_a before four_b.
    assert four_a in result_ids
    assert four_b in result_ids
    rank = {item["id"]: idx for idx, item in enumerate(results)}
    assert rank[four_a] < rank[four_b]
