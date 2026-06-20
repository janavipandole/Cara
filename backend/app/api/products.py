from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
def get_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products

@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/checkout")
def checkout_cart(request: schemas.CheckoutRequest, db: Session = Depends(get_db)):
    # Sort items to prevent deadlocks when locking multiple rows
    items = sorted(request.items, key=lambda x: x.name)
    
    try:
        # Atomic block
        for item in items:
            product = db.query(models.Product).filter(
                models.Product.name == item.name
            ).with_for_update().first()
            
            if not product:
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Product '{item.name}' not found")
                
            if product.stock < item.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for '{product.name}'. Only {product.stock} remaining."
                )
                
            product.stock -= item.quantity
            
        db.commit()
        return {"status": "success", "message": "Order placed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error during checkout: {str(e)}")
