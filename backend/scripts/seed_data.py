import argparse
import os
import sys

# Add parent dir to sys path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine
from app import models

products_data = [
  { "id": 1,  "brand": "adidas", "name": "Tropical Hibiscus Summer Shirt", "price": 78.0, "img": "images/products/f1.jpg", "rating": 5, "category": "street", "subcategory": "top", "style": "summer", "color": "multi" },
  { "id": 2,  "brand": "adidas", "name": "White Palm Leaf Casual Shirt", "price": 78.0, "img": "images/products/f2.jpg", "rating": 5, "category": "minimal", "subcategory": "top", "style": "casual", "color": "white" },
  { "id": 3,  "brand": "adidas", "name": "Vintage Rose Garden Shirt", "price": 78.0, "img": "images/products/f3.jpg", "rating": 5, "category": "minimal", "subcategory": "top", "style": "vintage", "color": "multi" },
  { "id": 4,  "brand": "adidas", "name": "Sakura Blossom Floral Shirt", "price": 78.0, "img": "images/products/f4.jpg", "rating": 5, "category": "minimal", "subcategory": "top", "style": "floral", "color": "white" },
  { "id": 5,  "brand": "adidas", "name": "Pink Peony Patterned Shirt", "price": 78.0, "img": "images/products/f5.jpg", "rating": 5, "category": "street", "subcategory": "top", "style": "pattern", "color": "pink" },
  { "id": 6,  "brand": "adidas", "name": "Dual-Tone Corduroy Shirt", "price": 78.0, "img": "images/products/f6.jpg", "rating": 5, "category": "street", "subcategory": "top", "style": "corduroy", "color": "multi" },
  { "id": 7,  "brand": "adidas", "name": "Embroidered Linen Trousers", "price": 78.0, "img": "images/products/f7.jpg", "rating": 5, "category": "street", "subcategory": "bottom", "style": "linen", "color": "beige" },
  { "id": 8,  "brand": "adidas", "name": "Cat Print Long Sleeve Blouse", "price": 78.0, "img": "images/products/f8.jpg", "rating": 5, "category": "minimal", "subcategory": "top", "style": "print", "color": "black" },
  { "id": 9,  "brand": "adidas", "name": "Sky Blue Mandarin Collar Shirt", "price": 78.0, "img": "images/products/n1.jpg", "rating": 5, "category": "formal", "subcategory": "top", "style": "mandarin", "color": "blue" },
  { "id": 10, "brand": "adidas", "name": "Navy Textured Formal Shirt", "price": 78.0, "img": "images/products/n2.jpg", "rating": 5, "category": "formal", "subcategory": "top", "style": "textured", "color": "navy" },
  { "id": 11, "brand": "adidas", "name": "Classic White Cotton Shirt", "price": 78.0, "img": "images/products/n3.jpg", "rating": 5, "category": "formal", "subcategory": "top", "style": "classic", "color": "white" },
  { "id": 12, "brand": "adidas", "name": "Sandstone Tactical Utility Shirt", "price": 78.0, "img": "images/products/n4.jpg", "rating": 5, "category": "formal", "subcategory": "top", "style": "utility", "color": "sand" },
  { "id": 13, "brand": "adidas", "name": "Denim Blue Everyday Shirt", "price": 79.0, "img": "images/products/n5.jpg", "rating": 5, "category": "minimal", "subcategory": "top", "style": "denim", "color": "blue" },
  { "id": 14, "brand": "adidas", "name": "Vertical Stripe Chino Shorts", "price": 78.0, "img": "images/products/n6.jpg", "rating": 5, "category": "minimal", "subcategory": "bottom", "style": "stripe", "color": "grey" },
  { "id": 15, "brand": "adidas", "name": "Khaki Safari Work Shirt", "price": 78.0, "img": "images/products/n7.jpg", "rating": 5, "category": "minimal", "subcategory": "top", "style": "safari", "color": "khaki" },
  { "id": 16, "brand": "adidas", "name": "Deep Charcoal Casual Shirt", "price": 78.0, "img": "images/products/n8.jpg", "rating": 5, "category": "minimal", "subcategory": "top", "style": "casual", "color": "charcoal" }
]

def _has_products(db) -> bool:
    return db.query(models.Product).first() is not None


def seed(force: bool = False) -> None:
    # Create any missing tables. create_all is non-destructive: it never drops
    # or modifies existing tables, so running the seed against an existing
    # database cannot wipe users, orders, or any other data.
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if _has_products(db) and not force:
            print(
                "Refusing to seed: the products table already contains data. "
                "Use --force to upsert the catalog instead."
            )
            return

        # Upsert by explicit id: existing products are updated, new ones are
        # inserted. Never deletes or duplicates data.
        seeded = 0
        for p_data in products_data:
            db.merge(models.Product(**p_data))
            seeded += 1
        db.commit()
        print(f"Database seeded successfully ({seeded} products upserted).")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the product catalog.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Upsert the catalog even if products already exist (never deletes data).",
    )
    args = parser.parse_args()
    seed(force=args.force)
