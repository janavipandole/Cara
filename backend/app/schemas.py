from datetime import datetime
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


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None


class UserProfileResponse(UserOut):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    updated_at: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type:   str
    user:         UserOut


class OrderItemResponse(BaseModel):
    product_name: str
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    full_name: str
    email: str
    address: str
    city: str
    zip_code: str
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

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
    idempotency_key: Optional[str] = None


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


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def new_password_complexity(cls, v: str) -> str:
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[@$!%*?&]", v):
            raise ValueError("Password must contain at least one special character (@$!%*?&).")
        return v


class CategorySummaryResponse(BaseModel):
    """Catalog metadata returned by /products/search/categories for building filter UIs."""
    categories: list[str]
    subcategories: list[str]
    colors: list[str]
    styles: list[str]
    price_range: PriceRange


class AdminSummaryResponse(BaseModel):
    """Lifetime dashboard indicators returned by GET /api/admin/analytics/summary."""
    total_revenue: float
    total_orders: int
    total_customers: int


class CategorySalesOut(BaseModel):
    """Sales aggregation by category returned by GET /api/admin/analytics/category-sales."""
    category: str
    units_sold: int
    revenue: float


class StatusDistributionOut(BaseModel):
    """Order volume distribution across statuses returned by GET /api/admin/analytics/order-status-distribution."""
    status: str
    count: int