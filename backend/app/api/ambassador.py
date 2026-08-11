from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from .. import models
from ..database import get_db

router = APIRouter()

# Sanity bound for social follower counts; anything above this is almost
# certainly malformed or fraudulent input and would overflow the column.
MAX_FOLLOWER_COUNT = 100_000_000


class AmbassadorApplyRequest(BaseModel):
    full_name: str
    email: EmailStr
    instagram_handle: str
    follower_count: int
    motivation: Optional[str] = None


@router.post("/apply", status_code=201)
def apply_ambassador(payload: AmbassadorApplyRequest, db: Session = Depends(get_db)):
    if payload.follower_count < 0:
        raise HTTPException(status_code=400, detail="Follower count cannot be negative")
    if payload.follower_count > MAX_FOLLOWER_COUNT:
        raise HTTPException(status_code=400, detail="Follower count is unreasonably large")

    application = models.AmbassadorApplication(
        full_name=payload.full_name,
        email=payload.email,
        instagram_handle=payload.instagram_handle,
        follower_count=payload.follower_count,
        motivation=payload.motivation,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return {
        "message": "Application submitted successfully",
        "id": application.id
    }
