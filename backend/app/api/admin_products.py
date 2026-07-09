from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()


def _enforce_admin(user: models.User = Depends(get_current_user)):
    if user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin privilege required")
    return user


@router.post("/", response_model=schemas.Product, status_code=201)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    existing = db.query(models.Product).filter(models.Product.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Product with this name already exists")
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=200)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


@router.patch("/{product_id}/stock")
def update_stock(
    product_id: int,
    stock: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")
    product.stock = stock
    db.commit()
    return {"message": "Stock updated", "stock": product.stock}
