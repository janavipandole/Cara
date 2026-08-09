import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from .. import models
from ..database import get_db

router = APIRouter()


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


class NewsletterUnsubscribeRequest(BaseModel):
    token: str


class RestockAlertRequest(BaseModel):
    email: EmailStr
    product_id: int


@router.post("/subscribe", status_code=201)
def subscribe(payload: NewsletterSubscribeRequest, db: Session = Depends(get_db)):
    existing = (
        db.query(models.NewsletterSubscriber)
        .filter(models.NewsletterSubscriber.email == payload.email)
        .first()
    )
    if existing:
        if not existing.is_active:
            existing.is_active = True
            if not existing.unsubscribe_token:
                existing.unsubscribe_token = secrets.token_urlsafe(32)
            db.commit()
        # Generic response regardless of prior state — avoids leaking
        # whether this email was already subscribed.
        return {"message": "Subscription request processed"}

    subscriber = models.NewsletterSubscriber(
        email=payload.email,
        unsubscribe_token=secrets.token_urlsafe(32),
    )
    db.add(subscriber)
    db.commit()
    return {"message": "Subscription request processed"}


@router.post("/unsubscribe")
def unsubscribe(payload: NewsletterUnsubscribeRequest, db: Session = Depends(get_db)):
    subscriber = (
        db.query(models.NewsletterSubscriber)
        .filter(models.NewsletterSubscriber.unsubscribe_token == payload.token)
        .first()
    )
    if not subscriber:
        raise HTTPException(status_code=400, detail="Invalid or expired unsubscribe link")

    subscriber.is_active = False
    db.commit()
    return {"message": "Successfully unsubscribed"}


@router.post("/restock", status_code=201)
def restock_alert(payload: RestockAlertRequest, db: Session = Depends(get_db)):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == payload.product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(models.RestockAlert)
        .filter(
            models.RestockAlert.email == payload.email,
            models.RestockAlert.product_id == payload.product_id,
        )
        .first()
    )
    if existing is None:
        db.add(
            models.RestockAlert(
                email=payload.email,
                product_id=payload.product_id,
            )
        )
        db.commit()
    # Generic response regardless of prior state — avoids leaking whether
    # this email was already registered for this product.
    return {"message": "Restock alert registered"}