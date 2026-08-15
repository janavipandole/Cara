"""Interaction retention: rows past the window / per-user cap are pruned."""
from datetime import datetime, timedelta, timezone
from hashlib import sha256

from app.models import Interaction, Product
from tests.conftest import TestingSessionLocal

FEEDBACK_URL = "/api/outfit/feedback"
PURGE_URL = "/api/admin/interactions/purge"

MAX_PER_USER = 200


def _hash(user_id):
    return sha256((user_id + "test-secret-key-1234567890abcdef").encode()).hexdigest()


def _seed_product():
    db = TestingSessionLocal()
    product = Product(
        brand="RetentionBrand",
        name="Retention Tee",
        price=50.0,
        img="r.jpg",
        rating=4,
        category="minimal",
        subcategory="top",
        color="white",
        style="casual",
        stock=100,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    product_id = product.id
    db.close()
    return product_id


def _insert_interactions(user_id, count, days_old=0):
    db = TestingSessionLocal()
    product_id = _seed_product()
    created = datetime.now(timezone.utc) - timedelta(days=days_old)
    for _ in range(count):
        db.add(
            Interaction(
                user_id=_hash(user_id),
                product_id=product_id,
                interaction_type="view",
                created_at=created,
            )
        )
    db.commit()
    db.close()


def _count_for_user(user_id):
    db = TestingSessionLocal()
    count = (
        db.query(Interaction)
        .filter(Interaction.user_id == _hash(user_id))
        .count()
    )
    db.close()
    return count


def test_feedback_trims_history_to_per_user_cap(client):
    # Seed 205 rows for the user, then one more through the API which prunes.
    _insert_interactions("cap-user", MAX_PER_USER + 5)
    _seed_product()  # product_id for the feedback call below

    db = TestingSessionLocal()
    product = db.query(Product).filter(Product.brand == "RetentionBrand").first()
    db.close()

    resp = client.post(
        FEEDBACK_URL,
        json={"user_id": "cap-user", "product_id": product.id, "interaction_type": "view"},
    )
    assert resp.status_code == 200
    assert _count_for_user("cap-user") == MAX_PER_USER


def test_feedback_prunes_rows_past_retention_window(client):
    _insert_interactions("old-user", 5, days_old=120)
    _insert_interactions("new-user", 1, days_old=1)
    _seed_product()

    db = TestingSessionLocal()
    product = db.query(Product).filter(Product.brand == "RetentionBrand").first()
    db.close()

    resp = client.post(
        FEEDBACK_URL,
        json={"user_id": "new-user", "product_id": product.id, "interaction_type": "view"},
    )
    assert resp.status_code == 200
    assert _count_for_user("old-user") == 0
    assert _count_for_user("new-user") == 2


def _count_all():
    db = TestingSessionLocal()
    count = db.query(Interaction).count()
    db.close()
    return count


def test_admin_purge_endpoint(client, admin_auth_headers):
    _insert_interactions("purge-user", 3, days_old=200)
    before = _count_all()

    resp = client.post(PURGE_URL, headers=admin_auth_headers)
    assert resp.status_code == 200
    # Only the three stale purge-user rows are removed; other users' recent
    # rows are untouched.
    assert resp.json()["remaining"] == before - 3
