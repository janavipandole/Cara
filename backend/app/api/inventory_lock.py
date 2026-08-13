from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta, timezone
from ..database import get_db
from .. import models
from ..limiter import limiter

router = APIRouter()

class ReserveInventoryRequest(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=100)
    session_id: str
    hold_minutes: int = Field(default=10, ge=1, le=60)

class ReleaseInventoryRequest(BaseModel):
    session_id: str

@router.post("/reserve")
@limiter.limit("30/minute")
def reserve_inventory(
    payload: ReserveInventoryRequest,
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)

    # 1. Clean up expired holds for this product first
    db.query(models.InventoryReservation).filter(
        models.InventoryReservation.product_id == payload.product_id,
        models.InventoryReservation.status == "HOLD",
        models.InventoryReservation.expires_at <= now,
    ).update({"status": "EXPIRED"})
    db.commit()

    # 2. Acquire row-level lock on Product
    product = (
        db.query(models.Product)
        .filter(models.Product.id == payload.product_id)
        .with_for_update()
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    # 3. Sum existing active holds
    active_holds = (
        db.query(func.coalesce(func.sum(models.InventoryReservation.quantity), 0))
        .filter(
            models.InventoryReservation.product_id == payload.product_id,
            models.InventoryReservation.status == "HOLD",
            models.InventoryReservation.expires_at > now,
        )
        .scalar()
    )

    available_stock = product.stock - active_holds
    if available_stock < payload.quantity:
        raise HTTPException(
            status_code=409,
            detail=f"Insufficient available stock. Only {max(0, available_stock)} items remaining.",
        )

    # 4. Create new reservation hold
    expires_at = now + timedelta(minutes=payload.hold_minutes)
    reservation = models.InventoryReservation(
        product_id=product.id,
        session_id=payload.session_id,
        quantity=payload.quantity,
        status="HOLD",
        expires_at=expires_at,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return {
        "status": "HOLD",
        "reservation_id": reservation.id,
        "product_id": product.id,
        "quantity": reservation.quantity,
        "expires_at": expires_at.isoformat(),
        "hold_seconds": payload.hold_minutes * 60,
    }


@router.post("/release-expired")
def release_expired_reservations(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    updated_count = (
        db.query(models.InventoryReservation)
        .filter(
            models.InventoryReservation.status == "HOLD",
            models.InventoryReservation.expires_at <= now,
        )
        .update({"status": "EXPIRED"})
    )
    db.commit()
    return {"status": "success", "released_count": updated_count}
