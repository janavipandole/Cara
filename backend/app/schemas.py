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
    stock: int = 10

class CheckoutItem(BaseModel):
    name: str
    quantity: int

class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]

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
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[@$!%*?&]", v):
            raise ValueError("Password must contain at least one special character (@$!%*?&).")
        if not re.match(r"^[A-Za-z\d@$!%*?&]{8,}$", v):
            raise ValueError("Password contains invalid characters. Only letters, numbers, and @$!%*?& are allowed.")
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
    quantity: int = Field(gt=0)

class OrderCreate(BaseModel):
    fullName: str
    email: EmailStr
    address: str
    city: str
    zip: str
    items: list[OrderItemCreate]
    coupon: Optional[str] = None


# -- Product Search / Filter Response Schemas --

class PaginatedProductsResponse(BaseModel):
    """Paginated wrapper returned by the /products/search/query endpoint."""
    total: int
    page: int
    page_size: int
    products: list["Product"]

    class Config:
        from_attributes = True


class PriceRange(BaseModel):
    min: float
    max: float


class CategorySummaryResponse(BaseModel):
    """Catalog metadata returned by /products/search/categories for building filter UIs."""
    categories: list[str]
    subcategories: list[str]
    colors: list[str]
    styles: list[str]
    price_range: PriceRange

