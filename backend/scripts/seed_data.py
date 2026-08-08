import argparse
import os
import sys

# Add parent dir to sys path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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


def _database_url() -> str:
    return os.environ.get("DATABASE_URL", "sqlite:///./cara.db")


def _is_local_database(url: str) -> bool:
    lowered = url.lower()
    if lowered.startswith("sqlite"):
        return True
    return "localhost" in lowered or "127.0.0.1" in lowered


def _wipe_database(*, force: bool, i_understand_production: bool) -> None:
    if not force:
        raise SystemExit(
            "Refusing to wipe the database. Pass --force to drop all tables, "
            "or omit it to upsert demo products only."
        )
    url = _database_url()
    if not _is_local_database(url) and not i_understand_production:
        raise SystemExit(
            "DATABASE_URL does not look local. Re-run with "
            "--force --i-understand-production if you really intend to wipe it."
        )
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    print("Database wiped and recreated.")


def seed(*, force: bool = False, i_understand_production: bool = False) -> None:
    if force:
        _wipe_database(
            force=force,
            i_understand_production=i_understand_production,
        )
    else:
        # Ensure tables exist without destroying existing data.
        models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for p_data in products_data:
            existing = db.query(models.Product).filter(models.Product.id == p_data["id"]).first()
            if existing:
                for key, value in p_data.items():
                    if key == "id":
                        continue
                    setattr(existing, key, value)
            else:
                db.add(models.Product(**p_data))
        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Seed Cara demo products.")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Drop and recreate all tables before seeding (destructive).",
    )
    parser.add_argument(
        "--i-understand-production",
        action="store_true",
        help="Required with --force when DATABASE_URL is not local.",
    )
    args = parser.parse_args(argv)
    seed(force=args.force, i_understand_production=args.i_understand_production)


if __name__ == "__main__":
    main()
