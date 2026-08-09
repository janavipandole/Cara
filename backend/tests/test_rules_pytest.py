"""Pytest suite for the outfit recommendation rules engine.

The existing backend/tests/test_rules.py is a standalone script; this file
exercises the same engine with pytest-style assertions and additional edge
cases such as missing colors, pattern clashes, and empty candidate lists.
"""
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest

from app.rules.engine import filter_by_rules


class MockProduct:
    def __init__(self, id, category, subcategory, color, style):
        self.id = id
        self.category = category
        self.subcategory = subcategory
        self.color = color
        self.style = style


def test_filters_self_and_same_subcategory():
    base = MockProduct(1, "formal", "top", "navy", "classic")
    candidates = [
        MockProduct(1, "formal", "top", "navy", "classic"),
        MockProduct(2, "formal", "top", "white", "classic"),
        MockProduct(3, "formal", "bottom", "grey", "classic"),
    ]
    results = filter_by_rules(base, candidates)
    assert [r.id for r in results] == [3]


def test_blocks_formal_mixed_with_non_formal():
    base = MockProduct(1, "formal", "top", "navy", "classic")
    candidates = [
        MockProduct(2, "street", "bottom", "black", "casual"),
    ]
    assert filter_by_rules(base, candidates) == []


def test_blocks_clashing_colors():
    base = MockProduct(1, "formal", "top", "navy", "classic")
    candidates = [
        MockProduct(2, "formal", "bottom", "black", "classic"),
        MockProduct(3, "formal", "bottom", "grey", "classic"),
    ]
    results = filter_by_rules(base, candidates)
    assert [r.id for r in results] == [3]


def test_blocks_mixed_heavy_patterns():
    base = MockProduct(10, "street", "top", "red", "floral")
    candidates = [
        MockProduct(11, "minimal", "bottom", "black", "stripe"),
        MockProduct(12, "minimal", "bottom", "beige", "casual"),
    ]
    results = filter_by_rules(base, candidates)
    assert [r.id for r in results] == [12]


def test_handles_empty_candidates():
    base = MockProduct(1, "formal", "top", "navy", "classic")
    assert filter_by_rules(base, []) == []


def test_allows_same_category_mixed_styles():
    base = MockProduct(1, "street", "top", "red", "casual")
    candidates = [
        MockProduct(2, "street", "bottom", "black", "casual"),
    ]
    results = filter_by_rules(base, candidates)
    assert [r.id for r in results] == [2]
