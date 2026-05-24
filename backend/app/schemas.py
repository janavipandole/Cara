from pydantic import BaseModel
from typing import Optional, List

class ProductBase(BaseModel):
    brand: str
    name: str
    price: float
    img: str
    rating: int
    category: str
    subcategory: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None

class ProductCreate(ProductBase):
    id: int

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

class InteractionCreate(BaseModel):
    user_id: str
    product_id: int
    interaction_type: str

class RecommendationRequest(BaseModel):
    product_id: int
    user_id: Optional[str] = None
    limit: Optional[int] = 4
