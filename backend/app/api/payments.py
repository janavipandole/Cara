"""Stripe PaymentIntent + webhook confirmation for Cara orders."""
from __future__ import annotations

import os
from typing import Optional

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from .auth import get_current_user

router = APIRouter()


def _stripe_secret() -> Optional[str]:
    return os.environ.get("STRIPE_SECRET_KEY") or None


def _stripe_webhook_secret() -> Optional[str]:
    return os.environ.get("STRIPE_WEBHOOK_SECRET") or None


def payments_enabled() -> bool:
    return bool(_stripe_secret())


class CreateIntentRequest(BaseModel):
    order_id: int = Field(gt=0)


@router.get("/config")
def payment_config():
    """Public publishable key for Stripe.js — never exposes the secret key."""
    return {
        "enabled": payments_enabled(),
        "publishable_key": os.environ.get("STRIPE_PUBLISHABLE_KEY", ""),
        "provider": "stripe",
    }


@router.post("/create-intent")
def create_payment_intent(
    payload: CreateIntentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    secret = _stripe_secret()
    if not secret:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway is not configured. Set STRIPE_SECRET_KEY.",
        )

    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == payload.order_id,
            models.Order.email == current_user.email,
        )
        .with_for_update()
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "CONFIRMED":
        raise HTTPException(status_code=400, detail="Order is already paid")
    if order.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Order is cancelled")

    stripe.api_key = secret
    amount_paise = max(1, int(round(float(order.total_amount) * 100)))

    if order.payment_intent_id:
        intent = stripe.PaymentIntent.retrieve(order.payment_intent_id)
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "order_id": order.id,
            "amount": order.total_amount,
        }

    intent = stripe.PaymentIntent.create(
        amount=amount_paise,
        currency=os.environ.get("STRIPE_CURRENCY", "inr"),
        metadata={
            "order_id": str(order.id),
            "email": current_user.email,
        },
        automatic_payment_methods={"enabled": True},
    )
    order.payment_intent_id = intent.id
    order.payment_method = "online"
    order.status = "PENDING"
    db.commit()

    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id,
        "order_id": order.id,
        "amount": order.total_amount,
    }


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
    stripe_signature: Optional[str] = Header(default=None, alias="Stripe-Signature"),
):
    """Confirm orders only after a verified Stripe webhook (never trust the browser)."""
    secret = _stripe_secret()
    wh_secret = _stripe_webhook_secret()
    if not secret or not wh_secret:
        raise HTTPException(status_code=503, detail="Stripe webhook is not configured")

    payload = await request.body()
    stripe.api_key = secret
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, wh_secret)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid webhook: {exc}") from exc

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        intent_id = intent.get("id")
        order = (
            db.query(models.Order)
            .filter(models.Order.payment_intent_id == intent_id)
            .with_for_update()
            .first()
        )
        if order and order.status != "CONFIRMED":
            order.status = "CONFIRMED"
            db.commit()
    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        intent_id = intent.get("id")
        order = (
            db.query(models.Order)
            .filter(models.Order.payment_intent_id == intent_id)
            .with_for_update()
            .first()
        )
        if order and order.status == "PENDING":
            # Leave unpaid so the buyer can cancel / retry; do not store PAN.
            order.status = "PENDING"
            db.commit()

    return {"received": True}
