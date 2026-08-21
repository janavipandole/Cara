"""Regression test: the ambassador_applications table must be created by migrations.

The ``AmbassadorApplication`` model existed in code before any Alembic migration
created its table, so databases provisioned via ``alembic upgrade head`` (the
documented docker-entrypoint flow) 500 on ``POST /api/ambassador/apply`` with
``relation "ambassador_applications" does not exist``.

This test reproduces that pre-fix migrated state (full schema minus the
ambassador table) and asserts that upgrading to head creates the table.
"""
import os

import sqlalchemy as sa
from alembic import command
from alembic.config import Config

from app import models

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALEMBIC_INI = os.path.join(BACKEND_DIR, "alembic.ini")
PREVIOUS_HEAD = "f1a2b3c4d5e6"


def _alembic_config() -> Config:
    cfg = Config(ALEMBIC_INI)
    cfg.set_main_option("script_location", os.path.join(BACKEND_DIR, "alembic"))
    return cfg


def test_ambassador_table_created_by_alembic_upgrade(monkeypatch, tmp_path):
    scratch = tmp_path / "scratch.db"
    url = f"sqlite:///{scratch.as_posix()}"

    # alembic/env.py reads the URL from app.database at migration time.
    import app.database as database

    monkeypatch.setattr(database, "SQLALCHEMY_DATABASE_URL", url)

    # Build the schema the way tests/conftest.py does, then drop the ambassador
    # table to reproduce the broken migrated database state (model present,
    # table absent).
    engine = sa.create_engine(url)
    models.Base.metadata.create_all(bind=engine)
    models.AmbassadorApplication.__table__.drop(bind=engine)
    engine.dispose()

    cfg = _alembic_config()
    command.stamp(cfg, PREVIOUS_HEAD)
    command.upgrade(cfg, "head")

    engine = sa.create_engine(url)
    inspector = sa.inspect(engine)
    assert "ambassador_applications" in inspector.get_table_names()
    columns = {col["name"] for col in inspector.get_columns("ambassador_applications")}
    assert columns == {
        "id",
        "full_name",
        "email",
        "instagram_handle",
        "follower_count",
        "motivation",
        "submitted_at",
    }
    engine.dispose()
