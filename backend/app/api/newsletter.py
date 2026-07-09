from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from .. import models
from ..database import get_db

router = APIRouter()


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


class NewsletterUnsubscribeRequest(BaseModel):
    email: EmailStr


@router.post("/subscribe", status_code=201)
def subscribe(payload: NewsletterSubscribeRequest, db: Session = Depends(get_db)):
    existing = (
        db.query(models.NewsletterSubscriber)
        .filter(models.NewsletterSubscriber.email == payload.email)
        .first()
    )
    if existing:
        if existing.is_active:
            raise HTTPException(status_code=409, detail="Email already subscribed")
        existing.is_active = True
        db.commit()
        return {"message": "Subscription reactivated"}

    subscriber = models.NewsletterSubscriber(email=payload.email)
    db.add(subscriber)
    db.commit()
    return {"message": "Successfully subscribed to newsletter"}


@router.post("/unsubscribe")
def unsubscribe(payload: NewsletterUnsubscribeRequest, db: Session = Depends(get_db)):
    subscriber = (
        db.query(models.NewsletterSubscriber)
        .filter(models.NewsletterSubscriber.email == payload.email)
        .first()
    )
    if not subscriber:
        raise HTTPException(status_code=404, detail="Email not found in subscriptions")

    subscriber.is_active = False
    db.commit()
    return {"message": "Successfully unsubscribed"}
