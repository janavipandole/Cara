from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from .. import models, schemas
from ..database import get_db

router = APIRouter()


# ---------------------------------------------------------------------------
# Existing endpoints (preserved exactly)
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[schemas.Product])
def get_products(
    skip: int = 0,
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
):
    return db.query(models.Product).offset(skip).limit(limit).all()


@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/checkout")
def checkout_cart(request: schemas.CheckoutRequest, db: Session = Depends(get_db)):
    # Sort items to prevent deadlocks when locking multiple rows
    items = sorted(request.items, key=lambda x: x.name)

    try:
        # Atomic block
        for item in items:
            product = db.query(models.Product).filter(
                models.Product.name == item.name
            ).with_for_update().first()

            if not product:
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Product '{item.name}' not found")

            if product.stock < item.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Only {product.stock} remaining.",
                )

            product.stock -= item.quantity

        db.commit()
        return {"status": "success", "message": "Order placed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error during checkout: {str(e)}")


# ---------------------------------------------------------------------------
# New: Search & Filter endpoint
# ---------------------------------------------------------------------------

class ProductSearchResponse:
    """Non-Pydantic helper — response is built as a plain dict for flexibility."""
    pass


@router.get("/search/query", response_model=schemas.PaginatedProductsResponse)
def search_products(
    q: Optional[str] = Query(
        default=None,
        min_length=1,
        max_length=100,
        description="Full-text keyword to match against product name and brand.",
    ),
    category: Optional[str] = Query(
        default=None,
        description="Filter by category slug (e.g. street, minimal, formal).",
    ),
    subcategory: Optional[str] = Query(
        default=None,
        description="Filter by subcategory (e.g. top, bottom, shoes).",
    ),
    color: Optional[str] = Query(default=None, description="Filter by colour."),
    style: Optional[str] = Query(default=None, description="Filter by style tag."),
    min_price: Optional[float] = Query(default=None, ge=0, description="Minimum price (inclusive)."),
    max_price: Optional[float] = Query(default=None, ge=0, description="Maximum price (inclusive)."),
    min_rating: Optional[int] = Query(default=None, ge=1, le=5, description="Minimum star rating."),
    in_stock: Optional[bool] = Query(
        default=None,
        description="When true, only return products with stock > 0.",
    ),
    sort_by: str = Query(
        default="relevance",
        description="Sort field: relevance | price_asc | price_desc | rating | newest.",
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    """
    Full-featured product search with keyword matching, multi-field filtering,
    sort options, and cursor-style pagination.

    All parameters are optional and composable — omitting them returns the full
    catalog ordered by the chosen ``sort_by`` strategy.
    """
    query = db.query(models.Product)

    # --- Keyword search: case-insensitive match on name OR brand ---------
    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                func.lower(models.Product.name).like(func.lower(search_term)),
                func.lower(models.Product.brand).like(func.lower(search_term)),
            )
        )

    # --- Categorical filters -----------------------------------------------
    if category:
        query = query.filter(
            func.lower(models.Product.category) == category.strip().lower()
        )
    if subcategory:
        query = query.filter(
            func.lower(models.Product.subcategory) == subcategory.strip().lower()
        )
    if color:
        query = query.filter(
            func.lower(models.Product.color) == color.strip().lower()
        )
    if style:
        query = query.filter(
            func.lower(models.Product.style) == style.strip().lower()
        )

    # --- Price range -------------------------------------------------------
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)

    # --- Rating floor ------------------------------------------------------
    if min_rating is not None:
        query = query.filter(models.Product.rating >= min_rating)

    # --- Stock availability ------------------------------------------------
    if in_stock is True:
        query = query.filter(models.Product.stock > 0)

    # --- Sorting -----------------------------------------------------------
    sort_map = {
        "price_asc": models.Product.price.asc(),
        "price_desc": models.Product.price.desc(),
        "rating": models.Product.rating.desc(),
        "newest": models.Product.id.desc(),
        "relevance": models.Product.id.asc(),   # default: stable id order
    }
    sort_clause = sort_map.get(sort_by, sort_map["relevance"])
    query = query.order_by(sort_clause)

    # --- Pagination --------------------------------------------------------
    total = query.count()
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "products": products,
    }


@router.get("/search/categories", response_model=schemas.CategorySummaryResponse)
def get_category_summary(db: Session = Depends(get_db)) -> dict:
    """
    Return the distinct categories, subcategories, colours, and styles
    present in the catalog — useful for populating filter dropdown menus
    on the frontend without hard-coding values.
    """
    categories   = [r[0] for r in db.query(func.distinct(models.Product.category)).filter(models.Product.category.isnot(None)).all()]
    subcategories = [r[0] for r in db.query(func.distinct(models.Product.subcategory)).filter(models.Product.subcategory.isnot(None)).all()]
    colors       = [r[0] for r in db.query(func.distinct(models.Product.color)).filter(models.Product.color.isnot(None)).all()]
    styles       = [r[0] for r in db.query(func.distinct(models.Product.style)).filter(models.Product.style.isnot(None)).all()]

    price_range = db.query(
        func.min(models.Product.price),
        func.max(models.Product.price),
    ).first()

    return {
        "categories": sorted(categories),
        "subcategories": sorted(subcategories),
        "colors": sorted(colors),
        "styles": sorted(styles),
        "price_range": {
            "min": price_range[0] if price_range[0] is not None else 0,
            "max": price_range[1] if price_range[1] is not None else 0,
        },
    }
