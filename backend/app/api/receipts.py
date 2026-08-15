from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
import hmac
import hashlib
import os
from ..database import get_db
from .. import models
from ..limiter import limiter

router = APIRouter()

SECRET_KEY = os.environ.get("SECRET_KEY", "fallback_secret_key_for_dev")

def generate_receipt_signature(order: models.Order) -> str:
    raw = f"{order.id}:{order.created_at.isoformat() if order.created_at else ''}:{order.total_amount}:{order.email}"
    return hmac.new(SECRET_KEY.encode("utf-8"), raw.encode("utf-8"), hashlib.sha256).hexdigest()

@router.get("/{order_id}/receipt")
@limiter.limit("20/minute")
def get_digital_receipt(request: Request, order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).all()
    signature = generate_receipt_signature(order)

    return {
        "order_id": order.id,
        "full_name": order.full_name,
        "email": order.email,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "signature": signature,
        "verification_url": f"/api/receipts/verify-receipt/{signature}",
        "items": [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": item.price,
            }
            for item in items
        ],
    }

@router.get("/verify-receipt/{signature}")
def verify_digital_receipt(signature: str, db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.id.desc()).limit(200).all()
    for order in orders:
        expected = generate_receipt_signature(order)
        if hmac.compare_digest(expected, signature):
            return {
                "valid": True,
                "order_id": order.id,
                "customer_name": order.full_name,
                "email": order.email,
                "total_amount": order.total_amount,
                "status": order.status,
                "issued_at": order.created_at.isoformat() if order.created_at else None,
            }

    return {"valid": False, "message": "Invalid or tampered receipt signature."}
