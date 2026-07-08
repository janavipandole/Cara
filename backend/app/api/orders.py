from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()


def serialize_order(order: models.Order, db: Session, include_items: bool = True) -> dict:
    payload = {
        "id": order.id,
        "full_name": order.full_name,
        "email": order.email,
        "address": order.address,
        "city": order.city,
        "zip_code": order.zip_code,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at,
        "items": [],
    }

    if include_items:
        items = (
            db.query(models.OrderItem)
            .filter(models.OrderItem.order_id == order.id)
            .order_by(models.OrderItem.id.asc())
            .all()
        )
        payload["items"] = [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": item.price,
            }
            for item in items
        ]

    return payload


@router.get("/", response_model=list[schemas.OrderResponse])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
):
    limit = min(limit, 100)
    orders = (
        db.query(models.Order)
        .filter(models.Order.email == current_user.email)
        .order_by(models.Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [serialize_order(order, db, include_items=False) for order in orders]


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id, models.Order.email == current_user.email)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return serialize_order(order, db, include_items=True)

@router.post("/", status_code=201)
def create_order(
    order_data: schemas.OrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    subtotal = 0.0
    db_items = []

    for item in order_data.items:
        db_product = db.query(models.Product).filter(
            models.Product.name == item.product_name
        ).first()

        if not db_product:
            raise HTTPException(
                status_code=400,
                detail=f"Product not found: {item.product_name}"
            )
            
        if db_product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product: {item.product_name}"
            )

        db_product.stock -= item.quantity

        real_price = db_product.price
        subtotal += real_price * item.quantity

        db_items.append(
            models.OrderItem(
                product_name=item.product_name,
                quantity=item.quantity,
                price=real_price
            )
        )

    shipping = 0.0 if subtotal >= 3000 else 150.0
    tax = round(subtotal * 0.18, 2)
    discount = 0.0

    valid_coupons = {
        "CARA20": 20,
        "WELCOME10": 10,
    }

    if order_data.coupon:
        coupon_code = order_data.coupon.strip().upper()

        if coupon_code not in valid_coupons:
            # Log this as a warning event for analysis of checkout friction
            # logger.warning(f"Invalid coupon attempt: {coupon_code}")
            raise HTTPException(
                status_code=400,
                detail="Invalid coupon code"
            )

        discount = round(
            subtotal * valid_coupons[coupon_code] / 100,
            2
        )


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

    return {
        "message": "Order created successfully",
        "order_id": new_order.id
    }
