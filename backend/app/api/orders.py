from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user

router = APIRouter()


def _serialize_order(order: models.Order) -> dict:
    """Convert a SQLAlchemy Order row into a dict suitable for OrderOut."""
    return {
        "id": order.id,
        "full_name": order.full_name,
        "email": order.email,
        "address": order.address,
        "city": order.city,
        "zip_code": order.zip_code,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else "",
        "items": [
            {
                "id": it.id,
                "product_name": it.product_name,
                "quantity": it.quantity,
                "price": it.price,
            }
            for it in (order.items or [])
        ],
        "status_history": [
            {
                "id": sh.id,
                "status": sh.status,
                "changed_at": sh.changed_at.isoformat() if sh.changed_at else "",
                "note": sh.note,
            }
            for sh in (order.status_history or [])
        ],
    }


@router.post("/", status_code=201)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
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
                detail=f"Product not found: {item.product_name}",
            )

        if db_product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product: {item.product_name}",
            )

        db_product.stock -= item.quantity
        real_price = db_product.price
        subtotal += real_price * item.quantity

        db_items.append(
            models.OrderItem(
                product_name=item.product_name,
                quantity=item.quantity,
                price=real_price,
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
            raise HTTPException(status_code=400, detail="Invalid coupon code")

        discount = round(subtotal * valid_coupons[coupon_code] / 100, 2)

    grand_total = max(0, subtotal + tax + shipping - discount)

    new_order = models.Order(
        user_id=current_user.id,          # link to authenticated user
        full_name=order_data.fullName,
        email=current_user.email,          # force email to match authenticated user
        address=order_data.address,
        city=order_data.city,
        zip_code=order_data.zip,
        total_amount=grand_total,
        status="CONFIRMED",
    )

    db.add(new_order)
    db.flush()  # flush so new_order.id is available before committing

    # Persist initial status event in audit trail
    initial_event = models.OrderStatusHistory(
        order_id=new_order.id,
        status="CONFIRMED",
        changed_at=datetime.now(timezone.utc),
        note="Order placed and confirmed.",
    )
    db.add(initial_event)

    for db_item in db_items:
        db_item.order_id = new_order.id
        db.add(db_item)

    db.commit()
    db.refresh(new_order)

    return {
        "message": "Order created successfully",
        "order_id": new_order.id,
    }


@router.get("/my-orders", response_model=schemas.PaginatedOrdersResponse)
def list_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=10, ge=1, le=50, description="Items per page"),
    status: str | None = Query(default=None, description="Filter by status (e.g. CONFIRMED, SHIPPED)"),
):
    """Return a paginated, optionally filtered list of the current user's orders."""
    query = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items),
            joinedload(models.Order.status_history),
        )
        .filter(models.Order.user_id == current_user.id)
    )

    if status:
        query = query.filter(models.Order.status == status.upper())

    total = query.count()
    offset = (page - 1) * page_size
    orders = query.order_by(models.Order.created_at.desc()).offset(offset).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "orders": [_serialize_order(o) for o in orders],
    }


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve full detail for a single order that belongs to the authenticated user."""
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items),
            joinedload(models.Order.status_history),
        )
        .filter(
            models.Order.id == order_id,
            models.Order.user_id == current_user.id,
        )
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    return _serialize_order(order)
