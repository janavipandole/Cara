"""Tests for CORS allow-origin configuration."""
import importlib
import os

import pytest


@pytest.fixture()
def reload_main(monkeypatch):
    def _reload(**env):
        monkeypatch.setenv("SECRET_KEY", "test-secret-key-for-pytest")
        for key, value in env.items():
            if value is None:
                monkeypatch.delenv(key, raising=False)
            else:
                monkeypatch.setenv(key, value)
        import app.main as main

        return importlib.reload(main)

    return _reload


def test_default_cors_includes_live_demo(reload_main, monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    main = reload_main(CORS_ORIGINS=None)
    origins = main._cors_allow_origins()
    assert isinstance(origins, list)
    assert {
        "https://cara-seven-ashen.vercel.app",
        "https://cara-janavipandoles-projects.vercel.app",
        "http://localhost:5500",
    }.issubset(set(origins))


def test_cors_origins_env_override(reload_main):
    main = reload_main(CORS_ORIGINS="https://example.com, http://localhost:3000")
    assert main._cors_allow_origins() == [
        "https://example.com",
        "http://localhost:3000",
    ]
