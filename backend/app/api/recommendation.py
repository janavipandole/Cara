from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
import hashlib
import os
from .. import models, schemas
from ..database import get_db
from ..vector_search.faiss_index import get_similar_product_ids
import hashlib
import os
from ..rules.engine import filter_by_rules
from ..limiter import limiter

router = APIRouter()
SALT = os.environ.get("SECRET_KEY", "fallback_secret_key_for_dev").encode('utf-8')

@router.post("/recommend", response_model=List[schemas.Product])
@limiter.limit("20/minute")
def recommend_outfit(request: Request, req: schemas.RecommendationRequest, db: Session = Depends(get_db)):
    base_product = db.query(models.Product).filter(models.Product.id == req.product_id).first()
    if not base_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Get similar items based on vector search
    candidate_ids = get_similar_product_ids(req.product_id, top_k=15)
    
    # Fetch candidates from DB
    candidates = db.query(models.Product).filter(models.Product.id.in_(candidate_ids)).all()
    
    # Map products by ID to preserve FAISS similarity ranking
    product_map = {p.id: p for p in candidates}
    ordered_candidates = [product_map[pid] for pid in candidate_ids if pid in product_map]
    
    # Apply strict business rules
    filtered_candidates = filter_by_rules(base_product, ordered_candidates)
    
    # In a real app, apply personalization re-ranking here
    # personalization_tracker.rerank(req.user_id, filtered_candidates)
    
    # Limit results
    limit = max(1, min(req.limit, 20))
    return filtered_candidates[:limit]

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
    return {"status": "success"}
