"""seed_data must not wipe DBs unless --force is passed."""
import importlib.util
from pathlib import Path

import pytest

from app import models
from tests.conftest import TestingSessionLocal, engine


SEED_PATH = Path(__file__).resolve().parents[1] / "scripts" / "seed_data.py"


def _load_seed_module():
    spec = importlib.util.spec_from_file_location("cara_seed_data", SEED_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_seed_without_force_preserves_existing_rows(monkeypatch):
    db = TestingSessionLocal()
    db.add(
        models.Product(
            id=99,
            brand="Keep",
            name="Keep Me",
            price=10.0,
            img="images/products/f1.jpg",
            rating=5,
            category="minimal",
            stock=3,
        )
    )
    db.commit()
    db.close()

    monkeypatch.setenv("DATABASE_URL", "sqlite:///./test.db")
    seed_mod = _load_seed_module()
    monkeypatch.setattr(seed_mod, "engine", engine)
    monkeypatch.setattr(seed_mod, "SessionLocal", TestingSessionLocal)

    seed_mod.seed(force=False)

    db = TestingSessionLocal()
    assert db.query(models.Product).filter(models.Product.id == 99).first() is not None
    assert db.query(models.Product).filter(models.Product.id == 1).first() is not None
    db.close()


def test_seed_force_requires_ack_for_non_local_url(monkeypatch):
    seed_mod = _load_seed_module()
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@db.example.com/cara")
    with pytest.raises(SystemExit):
        seed_mod.seed(force=True, i_understand_production=False)
