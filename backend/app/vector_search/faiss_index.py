import os

import faiss
import numpy as np
import torch
from transformers import CLIPModel, CLIPProcessor


INDEX_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "faiss_index.bin",
)

MODEL_NAME = "openai/clip-vit-base-patch32"

index = None
model = None
processor = None


def _load_model():
    global model, processor

    if model is None or processor is None:
        model = CLIPModel.from_pretrained(MODEL_NAME)
        processor = CLIPProcessor.from_pretrained(MODEL_NAME)


def load_index():
    global index

    if os.path.exists(INDEX_PATH):
        index = faiss.read_index(INDEX_PATH)
    else:
        print(
            "Warning: FAISS index not found. "
            "Please run precompute_embeddings.py"
        )


load_index()


def get_query_embedding(query: str) -> np.ndarray:
    """Generate a normalized CLIP text embedding for a search query."""
    _load_model()

    inputs = processor(
        text=[query],
        return_tensors="pt",
        padding=True,
        truncation=True,
    )

    with torch.no_grad():
        text_features = model.get_text_features(**inputs)

    embedding = text_features.cpu().numpy().astype("float32")
    embedding /= np.linalg.norm(embedding, axis=1, keepdims=True)

    return embedding


def search_products(query: str, top_k: int = 10):
    """Return product IDs matching a natural-language query."""
    if index is None:
        return []

    query = query.strip()

    if not query:
        return []

    try:
        query_embedding = get_query_embedding(query)

        distances, product_ids = index.search(
            query_embedding,
            top_k,
        )

        results = []

        for product_id, distance in zip(
            product_ids[0],
            distances[0],
        ):
            if product_id != -1:
                results.append(
                    {
                        "product_id": int(product_id),
                        "distance": float(distance),
                    }
                )

        return results

    except Exception as exc:
        print(f"Error in semantic search: {exc}")
        return []