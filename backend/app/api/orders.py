from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()

@router.post("/", status_code=201)
def create_order(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    subtotal = 0.0
    db_items = []
    
    for item in order_data.items:
        db_product = db.query(models.Product).filter(models.Product.name == item.product_name).first()
        if not db_product:
            raise HTTPException(status_code=400, detail=f"Product not found: {item.product_name}")
            
        real_price = db_product.price
        subtotal += real_price * item.quantity
        db_items.append(models.OrderItem(
            product_name=item.product_name,
            quantity=item.quantity,
            price=real_price
        ))
        
    shipping = 0.0 if subtotal >= 3000 else 150.0
    tax = round(subtotal * 0.18, 2)
    discount = 0.0
    
    if order_data.coupon == "CARA20" and subtotal > 0:
        discount = round(subtotal * 0.20, 2)
    elif order_data.coupon == "WELCOME10" and subtotal > 0:
        discount = round(subtotal * 0.10, 2)
        
    grand_total = max(0, subtotal + tax + shipping - discount)
    
    new_order = models.Order(
        full_name=order_data.fullName,
        email=current_user.email,  # Force email to match authenticated user
        address=order_data.address,
        city=order_data.city,
        zip_code=order_data.zip,
        total_amount=grand_total,
        status="CONFIRMED"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    for db_item in db_items:
        db_item.order_id = new_order.id
        db.add(db_item)
        
    db.commit()
    
    return {"message": "Order created successfully", "order_id": new_order.id}
