import pytest
from app.models import Product, Interaction
from app.rules.reranker import PersonalizedReranker
from tests.conftest import TestingSessionLocal
from datetime import datetime, timezone

def _seed_product(db, **kwargs) -> Product:
    defaults = dict(
        brand="TestBrand", name="Test Item", price=29.99,
        img="img.jpg", rating=4, category="street",
        subcategory="top", color="white", style="casual"
    )
    defaults.update(kwargs)
    p = Product(**defaults)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

def test_reranker_no_user_id():
    db = TestingSessionLocal()
    p1 = _seed_product(db, brand="Nike", color="Red", style="casual")
    p2 = _seed_product(db, brand="Adidas", color="Blue", style="sporty")
    db.close()

    candidates = [p1, p2]
    # Reranking with no user ID should return candidates unchanged
    result = PersonalizedReranker.rerank(None, None, candidates)
    assert result == candidates

def test_reranker_with_preferences():
    db = TestingSessionLocal()
    
    # Target products
    p_nike = _seed_product(db, brand="Nike", color="Red", style="sporty")
    p_adidas = _seed_product(db, brand="Adidas", color="Blue", style="classic")
    
    # Create historical interactions for user to build Nike preference
    user_id = "user_123_hashed"
    
    # 2 buys of nike items, 1 view of adidas item
    int1 = Interaction(user_id=user_id, product_id=p_nike.id, interaction_type="buy")
    int2 = Interaction(user_id=user_id, product_id=p_nike.id, interaction_type="buy")
    int3 = Interaction(user_id=user_id, product_id=p_adidas.id, interaction_type="view")
    
    db.add_all([int1, int2, int3])
    db.commit()
    
    # Candidates are ordered [Adidas, Nike] initially (FAISS order)
    candidates = [p_adidas, p_nike]
    
    result = PersonalizedReranker.rerank(db, user_id, candidates)
    db.close()
    
    # Nike should rank first now due to the heavy personalization bonus (2 buys)
    assert result[0].brand == "Nike"
