"""
Tests for the Mock Address Autocomplete API.
"""
from fastapi.testclient import TestClient

def test_address_suggestions_requires_q(client: TestClient):
    resp = client.get("/api/address/suggest")
    # Query parameter q is required, missing it returns 422
    assert resp.status_code == 422

def test_address_suggestions_matches_road(client: TestClient):
    resp = client.get("/api/address/suggest?q=MG Road")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) >= 1
    assert "Mumbai" in [item["city"] for item in body]

def test_address_suggestions_empty_no_matches(client: TestClient):
    resp = client.get("/api/address/suggest?q=NonexistentStreetName")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) == 0
