from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from .. import models, schemas
from ..database import get_db
from ..rules.engine import filter_by_rules

router = APIRouter()


def _normalize(value: Optional[str]):
    if value is None:
        return None
    return value.strip().lower()


def _rank_products(products):
    return sorted(
        products,
        key=lambda product: (
            -(product.rating or 0),
            product.price if product.price is not None else float("inf"),
            product.id,
        ),
    )


def _query_style_matches(db: Session, style: str, subcategory: Optional[str] = None):
    query = db.query(models.Product).filter(
        or_(
            func.lower(models.Product.category) == style,
            func.lower(models.Product.style) == style,
        )
    )

    if subcategory:
        query = query.filter(func.lower(models.Product.subcategory) == subcategory)

    return query.all()

@router.post("/recommend", response_model=List[schemas.Product])
def recommend_outfit(req: schemas.RecommendationRequest, db: Session = Depends(get_db)):
    normalized_style = _normalize(req.style)
    normalized_subcategory = _normalize(req.subcategory)

    if req.product_id is not None:
        base_product = db.query(models.Product).filter(models.Product.id == req.product_id).first()
        if not base_product:
            raise HTTPException(status_code=404, detail="Product not found")

        candidates = db.query(models.Product).filter(models.Product.id != base_product.id).all()
        filtered_candidates = filter_by_rules(base_product, candidates)

        if not filtered_candidates:
            filtered_candidates = candidates

        return _rank_products(filtered_candidates)[: req.limit]

    if not normalized_style:
        raise HTTPException(
            status_code=400,
            detail="Either product_id or style must be provided",
        )

    candidates = _query_style_matches(db, normalized_style, normalized_subcategory)

    if not candidates:
        candidates = db.query(models.Product).filter(
            or_(
                func.lower(models.Product.category) == normalized_style,
                func.lower(models.Product.style) == normalized_style,
            )
        ).all()

    if normalized_subcategory:
        narrowed_candidates = [
            product
            for product in candidates
            if _normalize(product.subcategory) == normalized_subcategory or product.subcategory is None
        ]
        if narrowed_candidates:
            candidates = narrowed_candidates

    return _rank_products(candidates)[: req.limit]

@router.post("/feedback")
def track_feedback(interaction: schemas.InteractionCreate, db: Session = Depends(get_db)):
    new_interaction = models.Interaction(**interaction.dict())
    db.add(new_interaction)
    db.commit()
    return {"status": "success"}
