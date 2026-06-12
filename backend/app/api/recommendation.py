from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..vector_search.faiss_index import get_similar_product_ids
from ..rules.engine import filter_by_rules

router = APIRouter()

@router.post("/recommend", response_model=List[schemas.Product])
def recommend_outfit(req: schemas.RecommendationRequest, db: Session = Depends(get_db)):
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
    return filtered_candidates[:req.limit]

@router.post("/feedback")
def track_feedback(interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == interaction.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    new_interaction = models.Interaction(**interaction.dict())
    db.add(new_interaction)
    db.commit()
    return {"status": "success"}
