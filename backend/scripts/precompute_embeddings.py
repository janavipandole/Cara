import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.vector_search.faiss_index import rebuild_index


def precompute():
    """Build the FAISS index + persisted embeddings from the current catalog."""
    db = SessionLocal()
    try:
        rebuild_index(db)
    finally:
        db.close()


if __name__ == "__main__":
    precompute()
