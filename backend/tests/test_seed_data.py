"""Tests for seed_data wipe guards and upsert behaviour."""
import importlib.util
from pathlib import Path

import pytest

SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "seed_data.py"


def _load_seed_module():
    spec = importlib.util.spec_from_file_location("seed_data_under_test", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


@pytest.fixture()
def seed_mod():
    return _load_seed_module()


def test_is_local_database(seed_mod):
    assert seed_mod._is_local_database("sqlite:///./cara.db") is True
    assert seed_mod._is_local_database("postgresql://user:pass@localhost:5432/cara") is True
    assert seed_mod._is_local_database("postgresql://user:pass@127.0.0.1:5432/cara") is True
    assert seed_mod._is_local_database("postgresql://user:pass@db.example.com:5432/cara") is False


def test_force_refuses_non_local_without_ack(seed_mod, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@db.example.com:5432/cara")
    with pytest.raises(SystemExit) as exc:
        seed_mod.main(["--force"])
    assert "does not look local" in str(exc.value)


def test_seed_upserts_without_drop(seed_mod, db_session, monkeypatch):
    from app import models
    from tests.conftest import TestingSessionLocal, engine as test_engine

    monkeypatch.setattr(seed_mod, "SessionLocal", TestingSessionLocal)
    monkeypatch.setattr(seed_mod, "engine", test_engine)

    existing = models.Product(
        id=1,
        brand="old",
        name="Old Name",
        price=1.0,
        img="old.jpg",
        rating=1,
        category="old",
    )
    db_session.merge(existing)
    db_session.commit()

    before_users = db_session.query(models.User).count()
    seed_mod.seed(force=False)
    db_session.expire_all()

    product = db_session.query(models.Product).filter(models.Product.id == 1).one()
    assert product.name == "Tropical Hibiscus Summer Shirt"
    assert product.brand == "adidas"
    assert db_session.query(models.User).count() == before_users
