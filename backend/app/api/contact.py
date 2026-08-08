from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field

from .. import models
from ..database import get_db
from ..limiter import limiter

router = APIRouter()


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    department: str = Field(min_length=1, max_length=80)
    message: str = Field(min_length=10, max_length=500)


@router.post("/", status_code=201)
@limiter.limit("5/minute")
def create_contact_message(
    request: Request,
    payload: ContactMessageCreate,
    db: Session = Depends(get_db),
):
    contact_message = models.ContactMessage(
        name=payload.name.strip(),
        email=str(payload.email).strip().lower(),
        subject=payload.subject.strip(),
        department=payload.department.strip(),
        message=payload.message.strip(),
    )
    db.add(contact_message)
    db.commit()
    db.refresh(contact_message)
    return {
        "message": "Contact message submitted successfully",
        "id": contact_message.id,
    }
