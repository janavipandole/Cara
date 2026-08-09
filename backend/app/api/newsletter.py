import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, EmailStr
from .. import models
from ..database import get_db

router = APIRouter()


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


class NewsletterUnsubscribeRequest(BaseModel):
    token: str


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
    try:
        db.commit()
    except IntegrityError:
        # Unique-constraint race on the email: another request subscribed
        # first. Roll back and respond with the same generic message rather
        # than an unhandled 500.
        db.rollback()
        return {"message": "Subscription request processed"}
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