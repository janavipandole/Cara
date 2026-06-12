from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

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

class InteractionType(str, Enum):
    view     = "view"
    click    = "click"
    wishlist = "wishlist"
    cart     = "cart"
    buy      = "buy"

class InteractionCreate(BaseModel):
    user_id: str
    product_id: int
    interaction_type: InteractionType

class RecommendationRequest(BaseModel):
    product_id: int
    user_id: Optional[str] = None
    limit: int = Field(default=4, ge=1, le=50)


# -- Role --
class RoleEnum(str, Enum):
    USER  = "USER"
    ADMIN = "ADMIN"


# -- Request Schemas --
class UserRegister(BaseModel):
    username: str
    email:    EmailStr
    password: str


class UserLogin(BaseModel):
    email:    EmailStr
    password: str


# -- Response Schemas --
class UserOut(BaseModel):
    id:        int
    username:  str
    email:     str
    role:      str
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         UserOut