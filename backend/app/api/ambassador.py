from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from .. import models
from ..database import get_db
from ..limiter import limiter

router = APIRouter()


class AmbassadorApplyRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    instagram_handle: str = Field(min_length=1, max_length=50)
    follower_count: int = Field(ge=0, le=100_000_000)
    motivation: Optional[str] = Field(default=None, max_length=2000)


@router.post("/apply", status_code=201)
@limiter.limit("3/minute")
def apply_ambassador(request: Request, payload: AmbassadorApplyRequest, db: Session = Depends(get_db)):
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
