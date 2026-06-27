"""
Wishlist API endpoints.

All endpoints require an authenticated session (JWT cookie).

Routes:
  GET    /api/wishlist/          — return paginated wishlist for the current user
  POST   /api/wishlist/{product_id} — toggle: add if absent, remove if already present
  DELETE /api/wishlist/{product_id} — explicit remove (idempotent)
  GET    /api/wishlist/check/{product_id} — check if a product is in the wishlist
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from .. import models
from ..database import get_db
from .auth import get_current_user

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_wishlist_item(
    db: Session, user_id: int, product_id: int
) -> models.WishlistItem | None:
    return (
        db.query(models.WishlistItem)
        .filter(
            models.WishlistItem.user_id == user_id,
            models.WishlistItem.product_id == product_id,
        )
        .first()
    )


def _serialize_item(item: models.WishlistItem) -> dict:
    p = item.product
    return {
        "wishlist_item_id": item.id,
        "added_at": item.added_at.isoformat() if item.added_at else "",
        "product": {
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "price": p.price,
            "img": p.img,
            "rating": p.rating,
            "category": p.category,
            "subcategory": p.subcategory,
            "color": p.color,
            "style": p.style,
            "stock": p.stock,
        },
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
def list_wishlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict:
    """Return a paginated list of products saved in the authenticated user's wishlist."""
    query = (
        db.query(models.WishlistItem)
        .options(joinedload(models.WishlistItem.product))
        .filter(models.WishlistItem.user_id == current_user.id)
        .order_by(models.WishlistItem.added_at.desc())
    )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [_serialize_item(i) for i in items],
    }


@router.post("/{product_id}")
def toggle_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict:
    """
    Toggle a product in the user's wishlist.
    - If the product is NOT in the wishlist, it is added.
    - If the product IS already in the wishlist, it is removed.

    Returns the new state so the frontend can update the UI without a
    separate check call.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    existing = _get_wishlist_item(db, current_user.id, product_id)

    if existing:
        db.delete(existing)
        db.commit()
        return {"action": "removed", "product_id": product_id, "in_wishlist": False}

    new_item = models.WishlistItem(
        user_id=current_user.id,
        product_id=product_id,
        added_at=datetime.now(timezone.utc),
    )
    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
    except IntegrityError:
        # Race condition: another request already inserted the same row
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Product is already in your wishlist.",
        )

    return {"action": "added", "product_id": product_id, "in_wishlist": True}


@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict:
    """
    Explicitly remove a product from the wishlist.
    Idempotent — returns success even if the item was not present.
    """
    item = _get_wishlist_item(db, current_user.id, product_id)
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Product removed from wishlist.", "product_id": product_id}


@router.get("/check/{product_id}")
def check_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict:
    """
    Lightweight endpoint to check whether a specific product is in the
    authenticated user's wishlist — used by product detail and listing pages
    to set the heart icon state without fetching the entire wishlist.
    """
    item = _get_wishlist_item(db, current_user.id, product_id)
    return {"product_id": product_id, "in_wishlist": item is not None}
