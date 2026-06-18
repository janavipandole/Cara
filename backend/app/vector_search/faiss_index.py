import faiss
import os
import numpy as np

index_path = os.path.join(os.path.dirname(__file__), '..', '..', 'faiss_index.bin')
index = None

if os.path.exists(index_path):
    index = faiss.read_index(index_path)
else:
    print("Warning: FAISS index not found. Please run precompute_embeddings.py")

def get_similar_product_ids(product_id: int, top_k: int = 10):
    if index is None:
        return []
    
    # Retrieve embedding for the given product_id
    try:
        # We need to map product_id to the embedding vector.
        # Faiss IndexIDMap allows us to search by vector, but not retrieve vector by ID directly easily in basic FlatL2.
        # Let's reconstruct the vector if possible, or we could just use a cached embedding dict.
        # For simplicity, we will reconstruct it if the index supports it. IndexFlatL2 doesn't support reconstruct directly with IDMap.
        # A simpler way is to just generate the synthetic vector again using the same seed to query.
        
        # In a real system, we'd fetch the vector from a DB or memory store.
        emb = embedding_store[product_id]
        emb = emb / np.linalg.norm(emb)
        
        # Search
        distances, indices = index.search(np.array([emb]), top_k)
        
        # Filter out self and return
        return [int(idx) for idx in indices[0] if idx != -1 and idx != product_id]
        
    except Exception as e:
        print(f"Error in vector search: {e}")
        return []
