import os
import sys

import faiss
import numpy as np
import torch
from transformers import CLIPModel, CLIPProcessor


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app import models

MODEL_NAME = "openai/clip-vit-base-patch32"
EMBEDDING_DIMENSION = 512


def build_product_text(product):
    """Build searchable text from the product's metadata."""
    fields = [
        product.name,
        product.brand,
        product.category,
        product.subcategory,
        product.color,
        product.style,
    ]

    return " ".join(
        str(field).strip()
        for field in fields
        if field
    )


def precompute():
    db = SessionLocal()

    try:
        products = db.query(models.Product).all()

        if not products:
            print("No products found.")
            return

        print(f"Loading {MODEL_NAME}...")
        model = CLIPModel.from_pretrained(MODEL_NAME)
        processor = CLIPProcessor.from_pretrained(MODEL_NAME)

        embeddings = []
        ids = []

        print(f"Generating embeddings for {len(products)} products...")

        for product in products:
            product_text = build_product_text(product)

            if not product_text:
                print(
                    f"Skipping product {product.id}: "
                    "no searchable metadata."
                )
                continue

            try:
                inputs = processor(
                    text=[product_text],
                    return_tensors="pt",
                    padding=True,
                    truncation=True,
                )

                with torch.no_grad():
                    text_features = model.get_text_features(**inputs)

                embedding = (
                    text_features.cpu()
                    .numpy()[0]
                    .astype("float32")
                )

                norm = np.linalg.norm(embedding)

                if norm == 0:
                    print(
                        f"Skipping product {product.id}: "
                        "zero-length embedding."
                    )
                    continue

                embedding /= norm

                embeddings.append(embedding)
                ids.append(product.id)

            except Exception as exc:
                print(
                    f"Error embedding product {product.id}: {exc}"
                )

        if not embeddings:
            print("No embeddings were generated.")
            return

        embeddings_np = np.array(
            embeddings,
            dtype="float32",
        )

        index = faiss.IndexFlatL2(EMBEDDING_DIMENSION)
        index_id_map = faiss.IndexIDMap(index)

        index_id_map.add_with_ids(
            embeddings_np,
            np.array(ids, dtype="int64"),
        )

        index_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "faiss_index.bin",
        )

        faiss.write_index(index_id_map, index_path)

        print(
            f"Saved text-based FAISS index with "
            f"{len(ids)} products."
        )

    finally:
        db.close()


if __name__ == "__main__":
    precompute()    finally:
        db.close()


if __name__ == "__main__":
    precompute()