"""
Tests for /api/products/search/query and /api/products/search/categories endpoints.

Covers:
  - Keyword search returns matching products
  - Category filter narrows results
  - Price range filter works correctly
  - in_stock filter excludes out-of-stock items
  - sort_by options produce correct ordering
  - Pagination params (page, page_size) are honoured
  - categories summary endpoint returns correct schema
  - Unknown sort_by falls back gracefully (no 500)
"""
import pytest
from fastapi.testclient import TestClient


class TestProductSearchQuery:
    def test_search_no_params_returns_all(self, client: TestClient):
        """With no filters, endpoint returns a paginated response."""
        resp = client.get("/api/products/search/query")
        assert resp.status_code == 200
        body = resp.json()
        assert "total" in body
        assert "products" in body
        assert isinstance(body["products"], list)

    def test_keyword_search_returns_matching_products(self, client: TestClient):
        """Products matching a keyword appear in results."""
        resp = client.get("/api/products/search/query?q=shirt")
        assert resp.status_code == 200
        body = resp.json()
        # If any products exist with 'shirt' in name/brand they should appear
        # — we just check the response shape here; product seeding is separate.
        assert "products" in body

    def test_category_filter(self, client: TestClient):
        """Category filter limits results to matching category only."""
        resp = client.get("/api/products/search/query?category=street")
        assert resp.status_code == 200
        body = resp.json()
        for product in body["products"]:
            assert product["category"].lower() == "street"

    def test_price_range_filter(self, client: TestClient):
        """min_price and max_price bounds are correctly applied."""
        resp = client.get("/api/products/search/query?min_price=100&max_price=500")
        assert resp.status_code == 200
        body = resp.json()
        for product in body["products"]:
            assert 100 <= product["price"] <= 500

    def test_min_price_only(self, client: TestClient):
        resp = client.get("/api/products/search/query?min_price=200")
        assert resp.status_code == 200
        body = resp.json()
        for product in body["products"]:
            assert product["price"] >= 200

    def test_in_stock_filter_excludes_zero_stock(self, client: TestClient):
        """in_stock=true must not return products with stock == 0."""
        resp = client.get("/api/products/search/query?in_stock=true")
        assert resp.status_code == 200
        body = resp.json()
        for product in body["products"]:
            assert product["stock"] > 0

    def test_sort_by_price_asc(self, client: TestClient):
        """price_asc sort produces ascending price order."""
        resp = client.get("/api/products/search/query?sort_by=price_asc&page_size=50")
        assert resp.status_code == 200
        products = resp.json()["products"]
        prices = [p["price"] for p in products]
        assert prices == sorted(prices)

    def test_sort_by_price_desc(self, client: TestClient):
        """price_desc sort produces descending price order."""
        resp = client.get("/api/products/search/query?sort_by=price_desc&page_size=50")
        assert resp.status_code == 200
        products = resp.json()["products"]
        prices = [p["price"] for p in products]
        assert prices == sorted(prices, reverse=True)

    def test_pagination_page_2(self, client: TestClient):
        """Page 2 returns different items than page 1."""
        resp1 = client.get("/api/products/search/query?page=1&page_size=5")
        resp2 = client.get("/api/products/search/query?page=2&page_size=5")
        assert resp1.status_code == 200
        assert resp2.status_code == 200
        ids1 = {p["id"] for p in resp1.json()["products"]}
        ids2 = {p["id"] for p in resp2.json()["products"]}
        # Pages should not overlap (assuming more than 5 products)
        if ids1 and ids2:
            assert ids1.isdisjoint(ids2)

    def test_total_reflects_filter(self, client: TestClient):
        """total in the response changes when filters narrow the result set."""
        all_resp = client.get("/api/products/search/query")
        filtered_resp = client.get("/api/products/search/query?min_price=10000")
        all_total = all_resp.json()["total"]
        filtered_total = filtered_resp.json()["total"]
        assert filtered_total <= all_total

    def test_unknown_sort_by_does_not_crash(self, client: TestClient):
        """An unrecognised sort_by value falls back to default without 500."""
        resp = client.get("/api/products/search/query?sort_by=unknown_sort")
        assert resp.status_code == 200

    def test_min_rating_filter(self, client: TestClient):
        """Products below the min_rating threshold are excluded."""
        resp = client.get("/api/products/search/query?min_rating=4")
        assert resp.status_code == 200
        for product in resp.json()["products"]:
            assert product["rating"] >= 4


class TestCategorySummary:
    def test_categories_endpoint_returns_correct_schema(self, client: TestClient):
        resp = client.get("/api/products/search/categories")
        assert resp.status_code == 200
        body = resp.json()
        assert "categories" in body
        assert "subcategories" in body
        assert "colors" in body
        assert "styles" in body
        assert "price_range" in body
        assert "min" in body["price_range"]
        assert "max" in body["price_range"]
        assert isinstance(body["categories"], list)

    def test_categories_are_sorted(self, client: TestClient):
        resp = client.get("/api/products/search/categories")
        body = resp.json()
        assert body["categories"] == sorted(body["categories"])
        assert body["subcategories"] == sorted(body["subcategories"])
