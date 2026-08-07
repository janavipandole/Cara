from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from .auth import get_current_user

router = APIRouter()


@router.get("/balance")
def get_loyalty_balance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return the authenticated user's authoritative loyalty balance."""
    account = (
        db.query(models.LoyaltyAccount)
        .filter(models.LoyaltyAccount.user_id == current_user.id)
        .first()
    )
    return {"balance": account.balance if account else 0}
