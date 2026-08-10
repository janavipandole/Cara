# Intelligent Multi-Faceted Product Filter Architecture

## Overview
The `ProductFacetFilter` module provides client-side catalog filtering, multi-facet refinement (categories, price bands, ratings, in-stock availability), and bi-directional URL query string synchronization.

## Architecture & Integration
- **Faceting Logic:** Pure functional filters mapping over catalog product arrays.
- **Deep Linking Sync:** Automatically reflects active user selections in URL query parameters (`?categories=tshirts&minPrice=20&inStock=true`), allowing users to copy and bookmark filtered search results.
- **State Reset:** Exposes `resetFilters()` method for one-click clearing of applied criteria.

## API Interface
- `setFilters(filterObject)`: Updates active filter state and executes criteria evaluation.
- `buildQueryParams()`: Serializes current filter state to URL search parameters.
- `parseQueryParams(queryString)`: Deserializes search parameters into active filter state.
- `resetFilters()`: Clears all active facets.
