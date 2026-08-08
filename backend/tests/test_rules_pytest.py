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


CLASHING_PAIRS = [
    ("red", "pink"),
    ("red", "orange"),
    ("red", "green"),
    ("navy", "black"),
    ("navy", "brown"),
    ("black", "brown"),
]


def test_clash_is_rejected_in_both_orientations():
    """Every clashing pair must be blocked with either color as the base.

    The rule used to be directed (only the dict key acted as the clash source),
    so e.g. base=green + candidate=red slipped through while the reverse was
    rejected. Both orientations must now behave identically.
    """
    for idx, (color_a, color_b) in enumerate(CLASHING_PAIRS):
        base_first = MockProduct(idx * 2 + 1, "formal", "top", color_a, "classic")
        cand_first = MockProduct(idx * 2 + 2, "formal", "bottom", color_b, "classic")
        assert filter_by_rules(base_first, [cand_first]) == [], (
            f"{color_a} base should clash with {color_b} candidate"
        )

        base_second = MockProduct(idx * 2 + 3, "formal", "top", color_b, "classic")
        cand_second = MockProduct(idx * 2 + 4, "formal", "bottom", color_a, "classic")
        assert filter_by_rules(base_second, [cand_second]) == [], (
            f"{color_b} base should clash with {color_a} candidate"
        )


def test_mirror_colors_not_in_dict_are_still_blocked():
    """Colors that only appear as *values* (pink/orange/green) must reject the
    reverse direction too, not just when they are the candidate."""
    for idx, base_color in enumerate(["pink", "orange", "green"]):
        base = MockProduct(100 + idx, "formal", "top", base_color, "classic")
        candidate = MockProduct(200 + idx, "formal", "bottom", "red", "classic")
        assert filter_by_rules(base, [candidate]) == [], (
            f"{base_color} base must clash with red candidate"
        )


def test_non_clashing_colors_are_allowed_in_both_orientations():
    base = MockProduct(1, "formal", "top", "red", "classic")
    candidate = MockProduct(2, "formal", "bottom", "blue", "classic")
    assert [r.id for r in filter_by_rules(base, [candidate])] == [2]

    base2 = MockProduct(3, "formal", "top", "blue", "classic")
    candidate2 = MockProduct(4, "formal", "bottom", "red", "classic")
    assert [r.id for r in filter_by_rules(base2, [candidate2])] == [4]
