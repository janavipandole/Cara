from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from ..database import get_db
from .. import models
from ..limiter import limiter

router = APIRouter()

class PricingCalculateRequest(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=1000)
    country_code: Optional[str] = "US"
    user_tier: Optional[str] = "STANDARD" # STANDARD, GOLD, PLATINUM

class PricingBreakdownResponse(BaseModel):
    product_id: int
    base_price: float
    discounted_unit_price: float
    total_price: float
    volume_discount_pct: float
    loyalty_discount_pct: float
    regional_multiplier: float
    savings_amount: float

REGIONAL_PPP_MULTIPLIERS = {
    "IN": 0.85,
    "BR": 0.85,
    "MX": 0.85,
    "US": 1.00,
    "GB": 1.00,
    "EU": 1.00,
    "CA": 1.00,
    "AU": 1.00,
}

LOYALTY_DISCOUNTS = {
    "STANDARD": 0.0,
    "GOLD": 0.05,
    "PLATINUM": 0.10,
}

def get_volume_discount_pct(quantity: int) -> float:
    if quantity >= 10:
        return 0.20
    if quantity >= 5:
        return 0.15
    if quantity >= 3:
        return 0.10
    return 0.0

@router.post("/calculate", response_model=PricingBreakdownResponse)
def calculate_dynamic_price(
    payload: PricingCalculateRequest,
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    base_price = float(product.price)
    quantity = payload.quantity

    # 1. Volume Tier Discount
    volume_discount_pct = get_volume_discount_pct(quantity)

    # 2. Loyalty Tier Discount
    loyalty_discount_pct = LOYALTY_DISCOUNTS.get((payload.user_tier or "STANDARD").upper(), 0.0)

    # 3. GeoIP Purchasing Power Adjustment
    regional_multiplier = REGIONAL_PPP_MULTIPLIERS.get((payload.country_code or "US").upper(), 1.0)

    # Calculate compound unit price
    combined_discount = 1.0 - (volume_discount_pct + loyalty_discount_pct)
    discounted_unit_price = round(base_price * combined_discount * regional_multiplier, 2)
    total_price = round(discounted_unit_price * quantity, 2)
    original_total = round(base_price * quantity, 2)
    savings_amount = max(0.0, round(original_total - total_price, 2))

    return {
        "product_id": product.id,
        "base_price": base_price,
        "discounted_unit_price": discounted_unit_price,
        "total_price": total_price,
        "volume_discount_pct": round(volume_discount_pct * 100, 1),
        "loyalty_discount_pct": round(loyalty_discount_pct * 100, 1),
        "regional_multiplier": regional_multiplier,
        "savings_amount": savings_amount,
    }
