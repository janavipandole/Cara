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

import os

import numpy as np

index_path = os.environ.get(
    "FAISS_INDEX_PATH",
    os.path.join(os.path.dirname(__file__), "..", "..", "faiss_index.bin"),
)

embeddings_path = os.environ.get(
    "FAISS_EMBEDDINGS_PATH",
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "faiss_embeddings.npz",
    ),
)

EMBEDDING_DIM = 512
MODEL_NAME = "openai/clip-vit-base-patch32"

_clip_loaded = False
_clip_model = None
_clip_processor = None


def _load_faiss():
    """Import FAISS lazily so the API can still start without it."""
    try:
        import faiss

        return faiss
    except Exception:
        return None


def _load_clip():
    """Load CLIP once and reuse it."""
    global _clip_loaded, _clip_model, _clip_processor

    if _clip_loaded:
        return _clip_model, _clip_processor

    _clip_loaded = True

    if os.environ.get("CARA_DISABLE_CLIP", "").lower() in (
        "1",
        "true",
        "yes",
    ):
        return None, None

    try:
        from transformers import CLIPModel, CLIPProcessor

        _clip_model = CLIPModel.from_pretrained(MODEL_NAME)
        _clip_processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    except Exception as exc:
        print(f"Failed to load CLIP: {exc}")
        _clip_model = None
        _clip_processor = None

    return _clip_model, _clip_processor


def _load_index(faiss):
    """Load the persisted FAISS index."""
    if faiss is None:
        return None

    if not os.path.exists(index_path):
        print(
            "Warning: FAISS index not found. "
            "Please run precompute_embeddings.py"
        )
        return None

    try:
        return faiss.read_index(index_path)
    except Exception as exc:
        print(f"Warning: Failed to load FAISS index: {exc}")
        return None


def _load_embeddings():
    """Load persisted product embeddings."""
    if not os.path.exists(embeddings_path):
        return None, None

    try:
        data = np.load(embeddings_path)
        return data["ids"], data["embeddings"]
    except Exception as exc:
        print(f"Warning: Failed to load persisted embeddings: {exc}")
        return None, None


def get_query_embedding(query: str) -> np.ndarray:
    """Generate a normalized CLIP text embedding."""
    model, processor = _load_clip()

    if model is None or processor is None:
        return None

    inputs = processor(
        text=[query],
        return_tensors="pt",
        padding=True,
        truncation=True,
    )

    import torch

    with torch.no_grad():
        text_features = model.get_text_features(**inputs)

    embedding = text_features.cpu().numpy().astype("float32")
    norm = np.linalg.norm(embedding, axis=1, keepdims=True)

    if np.any(norm == 0):
        return None

    embedding /= norm

    return embedding


faiss = _load_faiss()
index = _load_index(faiss)
embedding_ids, embeddings = _load_embeddings()


def search_products(query: str, top_k: int = 10):
    """Return products matching a natural-language query."""
    if index is None:
        return []

    query = query.strip()

    if not query:
        return []

    try:
        query_embedding = get_query_embedding(query)

        if query_embedding is None:
            return []

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


def _query_embedding(product_id):
    """Get the stored embedding for a product ID."""
    if embedding_ids is not None and embeddings is not None:
        match = np.where(embedding_ids == product_id)[0]

        if match.size:
            return embeddings[match[0]]

    return None


def _brute_force_similar(query, product_id, top_k):
    """Fallback similarity search using NumPy."""
    if embedding_ids is None or embeddings is None:
        return []

    if len(embeddings) == 0:
        return []

    diffs = embeddings - query
    distances = np.einsum("ij,ij->i", diffs, diffs)

    k = min(top_k, len(distances))

    if k <= 0:
        return []

    nearest = np.argpartition(distances, k - 1)[:k]
    nearest = nearest[np.argsort(distances[nearest])]

    ids = [int(embedding_ids[i]) for i in nearest]

    return [i for i in ids if i != product_id]


def get_similar_product_ids(product_id: int, top_k: int = 10):
    """Return similar product IDs."""
    if top_k <= 0:
        return []

    query = _query_embedding(product_id)

    if query is None:
        return []

    if faiss is not None and index is not None:
        try:
            distances, indices = index.search(
                np.array([query]),
                top_k,
            )

            return [
                int(idx)
                for idx in indices[0]
                if idx != -1 and idx != product_id
            ]

        except Exception as exc:
            print(f"Error in vector search: {exc}")

    return _brute_force_similar(
        query,
        product_id,
        top_k,
    )