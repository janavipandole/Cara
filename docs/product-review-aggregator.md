# Product Review Rating Aggregator Architecture

## Overview
`ProductReviewAggregator` manages review submission, validation, star rating distribution, and helpfulness voting per product. All review data is persisted via `localStorage`.

## Features
- **Rating Validation**: Rejects reviews with ratings outside 1–5 range.
- **Stats Aggregation**: Computes average rating and distribution histogram per product.
- **Helpful Votes**: Tracks helpfulness vote counts per individual review.
- **Sorting**: Returns reviews sorted by date (default), rating-desc, or rating-asc.

## Unit Test Coverage
Tested via Vitest in `tests/unit/product-review-aggregator.test.js`.
