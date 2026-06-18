from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
def get_products(db: Session = Depends(get_db)):
    def get_products(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return db.query(models.Product).offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
