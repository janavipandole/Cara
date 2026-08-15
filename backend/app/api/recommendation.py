from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
import hashlib
import os
from datetime import datetime, timedelta, timezone
from .. import models, schemas
from ..database import get_db
from ..vector_search.faiss_index import get_similar_product_ids, is_initialized
from ..rules.engine import filter_by_rules
from ..limiter import limiter

router = APIRouter()
SALT = os.environ.get("SECRET_KEY", "fallback_secret_key_for_dev").encode('utf-8')

# Retention policy for the interactions table. The personalized reranker only
# ever reads the newest 100 interactions per user, so older rows are dead
# weight; prune them so the table cannot grow without bound.
INTERACTION_RETENTION_DAYS = 90
MAX_INTERACTIONS_PER_USER = 200


def prune_interactions(db: Session) -> None:
    """Enforce the interaction retention policy.

    Deletes rows older than INTERACTION_RETENTION_DAYS and trims each user's
    history to the newest MAX_INTERACTIONS_PER_USER rows. Runs on every
    feedback insert and is also exposed via the admin purge endpoint.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=INTERACTION_RETENTION_DAYS)
    db.query(models.Interaction).filter(
        models.Interaction.created_at < cutoff
    ).delete(synchronize_session=False)

    users = db.query(models.Interaction.user_id).distinct().all()
    for (user_id,) in users:
        keep_ids = [
            row[0]
            for row in (
                db.query(models.Interaction.id)
                .filter(models.Interaction.user_id == user_id)
                .order_by(models.Interaction.created_at.desc())
                .limit(MAX_INTERACTIONS_PER_USER)
                .all()
            )
        ]
        if keep_ids:
            db.query(models.Interaction).filter(
                models.Interaction.user_id == user_id,
                ~models.Interaction.id.in_(keep_ids),
            ).delete(synchronize_session=False)
    db.commit()

@router.post("/recommend", response_model=List[schemas.Product])
@limiter.limit("20/minute")
def recommend_outfit(request: Request, req: schemas.RecommendationRequest, db: Session = Depends(get_db)):
    base_product = db.query(models.Product).filter(models.Product.id == req.product_id).first()
    if not base_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Determine the desired limit (between 1 and 20)
    limit = max(1, min(req.limit, 20))

    # Dynamically scale top_k to fetch a surplus of candidates to account for items dropped by filter_by_rules
    fetch_top_k = max(limit * 2, 30)

    # Get similar items based on vector search with dynamic top_k
    candidate_ids = get_similar_product_ids(req.product_id, top_k=fetch_top_k)
    
    # Fetch candidates from DB
    candidates = db.query(models.Product).filter(models.Product.id.in_(candidate_ids)).all()
    
    # Map products by ID to preserve FAISS similarity ranking
    product_map = {p.id: p for p in candidates}
    ordered_candidates = [product_map[pid] for pid in candidate_ids if pid in product_map]
    
    # Apply strict business rules
    filtered_candidates = filter_by_rules(base_product, ordered_candidates)

    if not filtered_candidates:
        # The FAISS index may be uninitialized (fresh deployment) or the query
        # product may have no embedding. Fall back to a deterministic,
        # catalog-based list (top-rated, in-stock) so the endpoint never
        # returns a bare empty list with no signal.
        filtered_candidates = (
            db.query(models.Product)
            .filter(models.Product.id != base_product.id)
            .filter(models.Product.stock > 0)
            .order_by(models.Product.rating.desc(), models.Product.id)
            .limit(fetch_top_k)
            .all()
        )

    # Apply personalization re-ranking based on user historical interactions
    hashed_user_id = None
    if req.user_id:
        hashed_user_id = hashlib.sha256(req.user_id.encode('utf-8') + SALT).hexdigest()
        
    from ..rules.reranker import PersonalizedReranker
    reranked_candidates = PersonalizedReranker.rerank(db, hashed_user_id, filtered_candidates)
    
    # Return up to the requested limit
    return reranked_candidates[:limit]


@router.get("/recommend/status")
def recommend_status():
    """Report whether the vector index is initialized for recommendations.

    Lets operators know when a fresh deployment has no FAISS artifacts yet and
    the endpoint is serving catalog-based fallback recommendations.
    """
    return {
        "index_initialized": is_initialized(),
        "fallback_enabled": True,
    }

@router.post("/feedback")
@limiter.limit("30/minute")
def track_feedback(request: Request, interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == interaction.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Anonymize PII (like raw IP addresses) via salted hashing before database insertion
    hashed_user_id = hashlib.sha256(interaction.user_id.encode('utf-8') + SALT).hexdigest()
    
    new_interaction = models.Interaction(
        user_id=hashed_user_id,
        product_id=interaction.product_id,
        interaction_type=interaction.interaction_type
    )
    db.add(new_interaction)
    db.commit()

    # Enforce the retention policy now that the new row is durable.
    try:
        prune_interactions(db)
    except Exception:
        # Pruning is best-effort maintenance; a failure must not break the
        # feedback recording itself.
        db.rollback()

    return {"status": "success"}
