"""
Admin analytics API endpoints.

Secure route for store managers/admins to fetch aggregates.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from .. import models, schemas
from ..database import get_db
from ..limiter import limiter
from .auth import get_current_user
from .recommendation import prune_interactions

router = APIRouter()


def _enforce_admin(user: models.User = Depends(get_current_user)):
    """Only allow users with role == 'ADMIN' to proceed."""
    if user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Admin privilege required."
        )
    return user


@router.get("/analytics/summary", response_model=schemas.AdminSummaryResponse)
@limiter.limit("10/minute")
def get_analytics_summary(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin)
) -> dict:
    """Return lifetime dashboard indicators (total revenue, order volume, customers count).

    Cancelled orders are excluded from revenue/order-volume aggregates so they are
    not reported as money earned.
    """
    completed_filter = models.Order.status != "CANCELLED"
    total_revenue = (
        db.query(func.sum(models.Order.total_amount))
        .filter(completed_filter)
        .scalar()
        or 0.0
    )
    total_orders = (
        db.query(func.count(models.Order.id))
        .filter(completed_filter)
        .scalar()
        or 0
    )
    total_users = db.query(func.count(models.User.id)).scalar() or 0

    return {
        "total_revenue": float(total_revenue),
        "total_orders": int(total_orders),
        "total_customers": int(total_users),
    }


@router.get("/analytics/category-sales", response_model=List[schemas.CategorySalesOut])
@limiter.limit("10/minute")
def get_sales_by_category(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin)
) -> list:
    """Return sales aggregation by category.

    Cancelled orders are excluded. Items are joined to the products table by name
    through an outer join; orphaned items (renamed/deleted products) are aggregated
    into an explicit "Unknown" bucket instead of being silently dropped.
    """
    results = (
        db.query(
            func.coalesce(models.Product.category, "Unknown").label("category"),
            func.sum(models.OrderItem.quantity).label("units_sold"),
            func.sum(models.OrderItem.price * models.OrderItem.quantity).label("revenue")
        )
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .outerjoin(models.Product, models.Product.name == models.OrderItem.product_name)
        .filter(models.Order.status != "CANCELLED")
        .group_by(models.Product.category)
        .all()
    )

    return [
        {
            "category": r[0] or "Unknown",
            "units_sold": int(r[1] or 0),
            "revenue": float(r[2] or 0.0)
        }
        for r in results
    ]


@router.get("/analytics/order-status-distribution", response_model=List[schemas.StatusDistributionOut])
@limiter.limit("10/minute")
def get_status_distribution(
    request: Request,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin)
) -> list:
    """Return volume distribution across statuses."""
    results = (
        db.query(models.Order.status, func.count(models.Order.id))
        .group_by(models.Order.status)
        .all()
    )

    return [
        {
            "status": r[0] or "Unknown",
            "count": int(r[1] or 0)
        }
        for r in results
    ]


@router.post("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin)
):
    """Transition an order's fulfillment status.

    Marking an order DELIVERED captures the delivery timestamp exactly once;
    the Estimated Return Date policy engine then exposes the immutable
    return deadline (delivered_at + 30 days) to the buyer.
    """
    from .orders import (
        ORDER_STATUSES,
        STATUS_TRANSITIONS,
        restore_order_stock,
        return_deadline,
        set_order_status,
    )

    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .with_for_update()
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.status not in ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid order status: {payload.status}",
        )

    if payload.status == order.status:
        # Same-status is a no-op; safe (never double-restores stock).
        db.commit()
        db.refresh(order)
    else:
        allowed = STATUS_TRANSITIONS.get(order.status, set())
        if payload.status not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status transition: {order.status} -> {payload.status}",
            )

        # Cancellation returns purchased units to inventory, matching the
        # buyer-cancel path, so cancelled orders never leak stock.
        if payload.status == "CANCELLED":
            restore_order_stock(db, order.id)

        set_order_status(order, payload.status)
        db.commit()
        db.refresh(order)

    return {
        "message": "Order status updated",
        "order_id": order.id,
        "status": order.status,
        "delivered_at": order.delivered_at,
        "return_deadline": return_deadline(order),
    }


@router.post("/interactions/purge")
def purge_old_interactions(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(_enforce_admin),
) -> dict:
    """Delete interactions past the retention window / per-user cap.

    Runs the same retention policy that feedback writes trigger, on demand.
    """
    prune_interactions(db)
    remaining = db.query(models.Interaction).count()
    return {"message": "Interactions purged", "remaining": remaining}
