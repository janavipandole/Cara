"""Unit tests for FAISS product image path resolution."""
import os
from types import SimpleNamespace

from app.vector_search import faiss_index


def test_product_image_root_is_outside_backend(monkeypatch):
    monkeypatch.delenv("PRODUCT_IMAGE_ROOT", raising=False)
    root = faiss_index._product_image_root()
    backend_dir = os.path.abspath(
        os.path.join(os.path.dirname(faiss_index.__file__), "..", "..")
    )
    assert root == os.path.dirname(backend_dir)
    assert os.path.basename(root) != "backend"
    assert not root.endswith(os.path.sep + "backend")


def test_resolve_product_image_path_joins_repo_images(monkeypatch):
    monkeypatch.delenv("PRODUCT_IMAGE_ROOT", raising=False)
    product = SimpleNamespace(img="images/products/f1.jpg")
    resolved = faiss_index._resolve_product_image_path(product)
    root = faiss_index._product_image_root()
    assert resolved == os.path.normpath(os.path.join(root, "images/products/f1.jpg"))
    # Prefer asserting a real catalog file when present in the checkout.
    if os.path.isdir(os.path.join(root, "images", "products")):
        assert "images" in resolved
        if os.path.exists(resolved):
            assert os.path.isfile(resolved)


def test_product_image_root_env_override(monkeypatch, tmp_path):
    monkeypatch.setenv("PRODUCT_IMAGE_ROOT", str(tmp_path))
    assert faiss_index._product_image_root() == str(tmp_path)
    product = SimpleNamespace(img="images/products/x.jpg")
    assert faiss_index._resolve_product_image_path(product) == os.path.normpath(
        os.path.join(str(tmp_path), "images/products/x.jpg")
    )
