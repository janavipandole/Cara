from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import logging
from .. import models, schemas
from ..database import get_db
from .auth import get_current_user
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

router = APIRouter()


def _existing_order_for_key(db: Session, email: str, idempotency_key: str | None):
    if not idempotency_key:
        return None
    return (
        db.query(models.Order)
        .filter(
            models.Order.email == email,
            models.Order.idempotency_key == idempotency_key,
        )
        .first()
    )


def _idempotent_replay(order_id: int) -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content={"message": "Order already created", "order_id": order_id},
    )


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
    skip: int = 0,
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.email == current_user.email)
        .order_by(models.Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [serialize_order(order, db, include_items=False) for order in orders]


@router.get("/{order_id}")
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.email == current_user.email,
        )
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
    # --- Idempotency check: if this key was already used, return the existing order ---
    existing = _existing_order_for_key(db, current_user.email, order_data.idempotency_key)
    if existing:
        return _idempotent_replay(existing.id)

    subtotal = 0.0
    db_items = []

    # --- Fetch all products in a single query to prevent N+1 issue ---
    product_names = [item.product_name for item in order_data.items]
    
    db_products = (
        db.query(models.Product)
        .filter(models.Product.name.in_(product_names))
        .with_for_update() # Apply row locks to all matching products simultaneously
        .all()
    )
    
    # Create a fast lookup map for the fetched products
    product_map = {product.name: product for product in db_products}

    for item in order_data.items:
        db_product = product_map.get(item.product_name)

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

        # Deduct stock in memory (will be committed later)
        db_product.stock -= item.quantity

        real_price = db_product.price
        subtotal += real_price * item.quantity

        db_items.append(
            models.OrderItem(
                product_id=db_product.id,
                product_name=item.product_name,
                quantity=item.quantity,
                price=real_price
            )
        )

    shipping = 0.0 if subtotal >= 3000 else 150.0
    tax = round(subtotal * 0.18, 2)
    discount = 0.0

    # --- Coupon Validation ---
    # Coupons are percentage-off codes defined in a static map that mirrors
    # the client-side `CARA_COUPONS` config (app.js). There is no Coupon table
    # in the database, so validating here keeps the backend consistent with
    # the frontend and avoids a runtime AttributeError on models.Coupon.
    COUPONS = {"CARA20": 20, "WELCOME10": 10}

    if order_data.coupon:
        coupon_code = order_data.coupon.strip().upper()

        discount_percentage = COUPONS.get(coupon_code)
        if discount_percentage is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid or inactive coupon code"
            )

        discount = round(subtotal * discount_percentage / 100, 2)

    grand_total = max(0, subtotal + tax + shipping - discount)

    new_order = models.Order(
        full_name=order_data.fullName,
        email=current_user.email,
        address=order_data.address,
        city=order_data.city,
        zip_code=order_data.zip,
        total_amount=grand_total,
        status="CONFIRMED",
        idempotency_key=order_data.idempotency_key,
    )

    db.add(new_order)
    try:
        # Use flush instead of commit to get new_order.id without finalizing prematurely
        db.flush()

        for db_item in db_items:
            db_item.order_id = new_order.id
            db.add(db_item)

        # Commit everything atomically in a single transaction
        db.commit()
    except IntegrityError:
        db.rollback()
        raced = _existing_order_for_key(db, current_user.email, order_data.idempotency_key)
        if raced:
            return _idempotent_replay(raced.id)
        raise HTTPException(
            status_code=500,
            detail="Could not create order due to a conflict. Please retry.",
        )

    db.refresh(new_order)

    return {
        "message": "Order created successfully",
        "order_id": new_order.id
    }

CANCELLABLE_WINDOW_HOURS = 24

@router.post("/{order_id}/cancel")
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.email == current_user.email,
        )
        .with_for_update()
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Order is already cancelled")

    # Guard against NULL created_at (legacy/manual rows): log and skip the
    # window check instead of crashing with a 500.
    if order.created_at is None:
        logger.warning(
            "Order %s has no created_at; skipping cancellable window check",
            order.id,
        )
    else:
        order_age = datetime.now(timezone.utc) - order.created_at.replace(tzinfo=timezone.utc)
        if order_age > timedelta(hours=CANCELLABLE_WINDOW_HOURS):
            raise HTTPException(
                status_code=400,
                detail=f"Orders can only be cancelled within {CANCELLABLE_WINDOW_HOURS} hours of placing them.",
            )

    items = (
        db.query(models.OrderItem)
        .filter(models.OrderItem.order_id == order.id)
        .all()
    )

    # Restore stock by the stable product_id so renamed/deleted products still
    # get their inventory back (or are reported explicitly when missing).
    product_ids = [item.product_id for item in items if item.product_id is not None]
    product_map = {}
    if product_ids:
        products = (
            db.query(models.Product)
            .filter(models.Product.id.in_(product_ids))
            .with_for_update()
            .all()
        )
        product_map = {product.id: product for product in products}

    missing_names = []
    for item in items:
        product = product_map.get(item.product_id) if item.product_id is not None else None
        if product is not None:
            product.stock += item.quantity
        else:
            missing_names.append(item.product_name)

    if missing_names:
        logger.warning(
            "Order %s cancelled but could not restore stock for missing products: %s",
            order.id,
            ", ".join(sorted(set(missing_names))),
        )

    order.status = "CANCELLED"
    db.commit()

    response = {"message": "Order cancelled successfully", "status": order.status}
    if missing_names:
        response["warning"] = (
            "Some items could not be restocked because their products were "
            "removed or renamed."
        )
    return response
