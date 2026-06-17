from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from enum import Enum
import re

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
    username: str = Field(min_length=3, max_length=30)
    email:    EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        return v


class UserLogin(BaseModel):
    email:    EmailStr
    password: str
    captcha_answer: Optional[str] = None
    captcha_token:  Optional[str] = None


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

class OrderItemCreate(BaseModel):
    product_name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    fullName: str
    email: EmailStr
    address: str
    city: str
    zip: str
    items: list[OrderItemCreate]
    coupon: Optional[str] = None