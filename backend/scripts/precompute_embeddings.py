import os
import sys
import numpy as np
from PIL import Image

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app import models
import faiss

# Try importing transformers, fallback if not available
try:
    from transformers import CLIPProcessor, CLIPModel
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

def precompute():
    global HAS_TRANSFORMERS
    db = SessionLocal()
    products = db.query(models.Product).all()
    
    # We will use a dimension of 512 for CLIP
    d = 512 
    index = faiss.IndexFlatL2(d)
    
    ids = []
    embeddings = []
    
    if HAS_TRANSFORMERS:
        print("Loading CLIP model (this may take a moment)...")
        model_name = "openai/clip-vit-base-patch32"
        try:
            model = CLIPModel.from_pretrained(model_name)
            processor = CLIPProcessor.from_pretrained(model_name)
        except Exception as e:
            print(f"Failed to load CLIP: {e}. Using fallback synthetic embeddings.")
            HAS_TRANSFORMERS = False

    for p in products:
        img_path = os.path.join(os.path.dirname(__file__), '..', '..', p.img)
        emb = None
        
        if HAS_TRANSFORMERS and os.path.exists(img_path):
            try:
                image = Image.open(img_path).convert("RGB")
                inputs = processor(images=image, return_tensors="pt")
                with torch.no_grad():
                    image_features = model.get_image_features(**inputs)
                emb = image_features.numpy()[0]
                # Normalize
                emb = emb / np.linalg.norm(emb)
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
                
        if emb is None:
            # Fallback synthetic embedding based on id
            np.random.seed(p.id)
            emb = np.random.rand(d).astype('float32')
            emb = emb / np.linalg.norm(emb)
            
        embeddings.append(emb)
        ids.append(p.id)
        
    embeddings_np = np.array(embeddings).astype('float32')
    
    # Map faiss ids to product ids
    index_id_map = faiss.IndexIDMap(index)
    index_id_map.add_with_ids(embeddings_np, np.array(ids).astype('int64'))
    
    faiss.write_index(index_id_map, os.path.join(os.path.dirname(__file__), '..', 'faiss_index.bin'))
    print(f"Saved FAISS index with {len(ids)} products.")
    db.close()

if __name__ == "__main__":
    precompute()
