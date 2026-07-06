from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=list[schemas.Product])
def get_wishlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    items = (
        db.query(models.Wishlist)
        .filter(models.Wishlist.user_id == current_user.id)
        .all()
    )
    product_ids = [item.product_id for item in items]
    products = (
        db.query(models.Product)
        .filter(models.Product.id.in_(product_ids))
        .all()
    )
    return products


@router.post("/{product_id}", status_code=201)
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(models.Wishlist)
        .filter(
            models.Wishlist.user_id == current_user.id,
            models.Wishlist.product_id == product_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Product already in wishlist")

    wishlist_item = models.Wishlist(
        user_id=current_user.id,
        product_id=product_id,
    )
    db.add(wishlist_item)
    db.commit()
    return {"message": "Product added to wishlist"}


@router.delete("/{product_id}", status_code=200)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = (
        db.query(models.Wishlist)
        .filter(
            models.Wishlist.user_id == current_user.id,
            models.Wishlist.product_id == product_id,
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Product not in wishlist")

    db.delete(item)
    db.commit()
    return {"message": "Product removed from wishlist"}
