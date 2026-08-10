from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..vector_search.faiss_index import search_products

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
def get_products(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return db.query(models.Product).offset(skip).limit(limit).all()
    @router.get("/search")
def semantic_search(
    q: str,
    top_k: int = 10,
    db: Session = Depends(get_db),
):
    query = q.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty",
        )

    if top_k < 1 or top_k > 50:
        raise HTTPException(
            status_code=400,
            detail="top_k must be between 1 and 50",
        )

    results = search_products(query, top_k)

    if not results:
        return []

    product_ids = [result["product_id"] for result in results]

    products = (
        db.query(models.Product)
        .filter(models.Product.id.in_(product_ids))
        .all()
    )

    products_by_id = {
        product.id: product
        for product in products
    }

    response = []

    for result in results:
        product = products_by_id.get(result["product_id"])

        if product:
            response.append(
                {
                    "product": schemas.Product.model_validate(product),
                    "distance": result["distance"],
                }
            )

    return response

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
