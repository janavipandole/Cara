import os
import numpy as np

index_path = os.path.join(os.path.dirname(__file__), '..', '..', 'faiss_index.bin')
embeddings_path = os.path.join(os.path.dirname(__file__), '..', '..', 'faiss_embeddings.npz')


def _load_faiss():
    """Import faiss lazily so the API still boots when it is unavailable."""
    try:
        import faiss
        return faiss
    except Exception:
        return None


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


def _query_embedding(product_id):
    """Resolve the stored embedding for a product, preferring persisted data."""
    if embedding_ids is not None and embeddings is not None:
        match = np.where(embedding_ids == product_id)[0]
        if match.size:
            return embeddings[match[0]]

    if faiss is not None and index is not None:
        try:
            emb = np.zeros((index.d,), dtype='float32')
            index.reconstruct(product_id, emb)
            return emb
        except Exception:
            pass

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
