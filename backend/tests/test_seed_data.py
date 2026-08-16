"""seed_data.py must never drop tables; it guards and upserts instead."""
import importlib.util
import os

import sqlalchemy
from sqlalchemy.orm import sessionmaker

from app import models

_SEED_PATH = os.path.join(os.path.dirname(__file__), "..", "scripts", "seed_data.py")


def _load_seed_data():
    spec = importlib.util.spec_from_file_location("seed_data", _SEED_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


seed_data = _load_seed_data()


def _tmp_session():
    engine = sqlalchemy.create_engine(
        "sqlite://",
        poolclass=sqlalchemy.pool.StaticPool,
        connect_args={"check_same_thread": False},
    )
    TestSession = sessionmaker(bind=engine)
    return engine, TestSession


def _patch(monkeypatch):
    engine, TestSession = _tmp_session()
    models.Base.metadata.create_all(bind=engine)
    monkeypatch.setattr(seed_data, "engine", engine)
    monkeypatch.setattr(seed_data, "SessionLocal", TestSession)
    return TestSession


def test_seed_does_not_duplicate_without_force(monkeypatch):
    TestSession = _patch(monkeypatch)

    seed_data.seed()
    assert TestSession().query(models.Product).count() == len(seed_data.products_data)

    seed_data.seed()
    assert TestSession().query(models.Product).count() == len(seed_data.products_data)


def test_seed_force_upserts_instead_of_duplicating(monkeypatch):
    TestSession = _patch(monkeypatch)

    seed_data.seed(force=True)
    seed_data.seed(force=True)
    assert TestSession().query(models.Product).count() == len(seed_data.products_data)


def test_seed_upsert_updates_existing_product(monkeypatch):
    TestSession = _patch(monkeypatch)

    db = TestSession()
    db.add(
        models.Product(
            id=1,
            brand="old",
            name="Old Name",
            price=1.0,
            img="x.jpg",
            rating=1,
            category="street",
            subcategory="top",
            stock=1,
        )
    )
    db.commit()
    db.close()

    seed_data.seed(force=True)

    db = TestSession()
    updated = db.query(models.Product).filter(models.Product.id == 1).first()
    assert updated.name == "Tropical Hibiscus Summer Shirt"
    db.close()


def test_seed_creates_tables_without_dropping(monkeypatch):
    """Non-product tables must survive a seed run untouched."""
    TestSession = _patch(monkeypatch)

    db = TestSession()
    db.add(
        models.User(
            username="keepme",
            email="keepme@example.com",
            hashed_password="x",
        )
    )
    db.commit()
    db.close()

    seed_data.seed(force=True)

    db = TestSession()
    assert db.query(models.User).filter(models.User.email == "keepme@example.com").count() == 1
    assert db.query(models.Product).count() == len(seed_data.products_data)
    db.close()
