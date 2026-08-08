import os
import numpy as np

index_path = os.environ.get(
    "FAISS_INDEX_PATH",
    os.path.join(os.path.dirname(__file__), '..', '..', 'faiss_index.bin'),
)
embeddings_path = os.environ.get(
    "FAISS_EMBEDDINGS_PATH",
    os.path.join(os.path.dirname(__file__), '..', '..', 'faiss_embeddings.npz'),
)
EMBEDDING_DIM = 512

# Lazily-loaded CLIP handles so runtime rebuilds do not reload the model every call.
_clip_loaded = False
_clip_model = None
_clip_processor = None


def _load_faiss():
    """Import faiss lazily so the API still boots when it is unavailable."""
    try:
        import faiss
        return faiss
    except Exception:
        return None


def _load_clip():
    """Load the CLIP model + processor once; return (model, processor) or (None, None)."""
    global _clip_loaded, _clip_model, _clip_processor
    if _clip_loaded:
        return _clip_model, _clip_processor
    _clip_loaded = True
    if os.environ.get("CARA_DISABLE_CLIP", "").lower() in ("1", "true", "yes"):
        _clip_model, _clip_processor = None, None
        return _clip_model, _clip_processor
    try:
        from transformers import CLIPProcessor, CLIPModel
        _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    except Exception as e:
        print(f"Failed to load CLIP: {e}. Using fallback synthetic embeddings.")
        _clip_model, _clip_processor = None, None
    return _clip_model, _clip_processor


def _product_image_root():
    """Repo-root (or PRODUCT_IMAGE_ROOT) where catalog `images/` assets live.

    ``__file__`` is ``backend/app/vector_search/faiss_index.py``; three dirname
    hops land on the repository root, not ``backend/``.
    """
    override = os.environ.get("PRODUCT_IMAGE_ROOT")
    if override:
        return os.path.abspath(override)
    return os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..")
    )


def _resolve_product_image_path(product):
    """Join the image root with ``product.img`` and normalize the path."""
    return os.path.normpath(os.path.join(_product_image_root(), product.img))


def _embedding_for_product(product):
    """Embed a single product image; fall back to a deterministic synthetic vector."""
    model, processor = _load_clip()
    img_path = _resolve_product_image_path(product)
    if model is not None and processor is not None and os.path.exists(img_path):
        try:
            from PIL import Image
            import torch
            image = Image.open(img_path).convert("RGB")
            inputs = processor(images=image, return_tensors="pt")
            with torch.no_grad():
                image_features = model.get_image_features(**inputs)
            emb = image_features.numpy()[0]
            return (emb / np.linalg.norm(emb)).astype('float32')
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
    np.random.seed(product.id)
    emb = np.random.rand(EMBEDDING_DIM).astype('float32')
    return emb / np.linalg.norm(emb)


def _load_index(faiss):
    """Load the persisted FAISS index if the library and file are available."""
    if faiss is None:
        return None
    if not os.path.exists(index_path):
        print("Warning: FAISS index not found. Please run precompute_embeddings.py")
        return None
    try:
        return faiss.read_index(index_path)
    except Exception as e:
        print(f"Warning: Failed to load FAISS index: {e}")
        return None


def _load_embeddings():
    """Load the persisted product embeddings for brute-force search."""
    if not os.path.exists(embeddings_path):
        return None, None
    try:
        data = np.load(embeddings_path)
        return data['ids'], data['embeddings']
    except Exception as e:
        print(f"Warning: Failed to load persisted embeddings: {e}")
        return None, None


faiss = _load_faiss()
index = _load_index(faiss)
embedding_ids, embeddings = _load_embeddings()


def rebuild_index(db):
    """Rebuild the persisted FAISS index + embeddings from the current catalog.

    Called after admin product create/update/delete so recommendations always
    reflect the live catalog instead of a stale offline snapshot. Refreshes the
    module-level objects used by the search paths.
    """
    global index, embedding_ids, embeddings

    from .. import models

    products = db.query(models.Product).all()

    ids = []
    embs = []
    for product in products:
        ids.append(product.id)
        embs.append(_embedding_for_product(product))

    embeddings_np = np.array(embs, dtype='float32')
    if len(embs):
        embeddings_np = embeddings_np.reshape(-1, EMBEDDING_DIM)
    ids_np = np.array(ids).astype('int64')

    # Persist embeddings for brute-force fallback.
    np.savez(embeddings_path, ids=ids_np, embeddings=embeddings_np)

    # Rebuild the FAISS index with product-id labels.
    if faiss is not None:
        try:
            index_id_map = faiss.IndexIDMap(faiss.IndexFlatL2(EMBEDDING_DIM))
            if len(ids):
                index_id_map.add_with_ids(embeddings_np, ids_np)
            faiss.write_index(index_id_map, index_path)
            index = index_id_map
        except Exception as e:
            print(f"Warning: Failed to rebuild FAISS index: {e}")
            index = None

    embedding_ids = ids_np
    embeddings = embeddings_np
    print(f"Rebuilt FAISS index with {len(ids)} products.")
    return index, embedding_ids, embeddings


def _query_embedding(product_id):
    """Resolve the stored embedding for a product by its id.

    Only the persisted id -> embedding mapping is used. FAISS reconstruct() takes
    a positional vector index (not a product id), so it is never used here; when
    the mapping is unavailable we return None rather than a wrong vector.
    """
    if embedding_ids is not None and embeddings is not None:
        match = np.where(embedding_ids == product_id)[0]
        if match.size:
            return embeddings[match[0]]

    return None


def _brute_force_similar(query, product_id, top_k):
    """NumPy L2-nearest-neighbour search over persisted embeddings."""
    if embedding_ids is None or embeddings is None:
        return []
    if len(embeddings) == 0:
        return []

    diffs = embeddings - query
    distances = np.einsum('ij,ij->i', diffs, diffs)
    k = min(top_k, len(distances))
    nearest = np.argpartition(distances, k - 1)[:k]
    nearest = nearest[np.argsort(distances[nearest])]
    ids = [int(embedding_ids[i]) for i in nearest]
    return [i for i in ids if i != product_id]


def get_similar_product_ids(product_id: int, top_k: int = 10):
    if top_k <= 0:
        return []

    query = _query_embedding(product_id)
    if query is None:
        return []

    if faiss is not None and index is not None:
        try:
            distances, indices = index.search(np.array([query]), top_k)
            return [int(idx) for idx in indices[0] if idx != -1 and idx != product_id]
        except Exception as e:
            print(f"Error in vector search: {e}")

    return _brute_force_similar(query, product_id, top_k)
