# Smart Search & Synonym Filter Engine Architecture

## Overview
The `SmartSearchEngine` component provides client-side instant search capabilities with fuzzy term resolution, multi-field indexing, category filtering, price bounds evaluation, and search query persistence.

## Key Components
- **Synonym Matcher**: Expands queries like `tee` to match `tshirt`, `shirt`, and `top`.
- **Multi-Filter Pipeline**: Applies sequential filters for keyword query, category, price range, and sorting.
- **Search History Manager**: Persists recent search queries in `localStorage` with deduplication and size cap limit.

## API Specification
```javascript
const searchEngine = new SmartSearchEngine(productsList);

// Execute query search
const results = searchEngine.filter({
  query: 'denim',
  category: 'pants',
  minPrice: 10,
  maxPrice: 100,
  sortBy: 'price-asc'
});

// Retrieve search history
const history = searchEngine.getHistory();
```

## Unit Test Coverage
Tested via Vitest in `tests/unit/smart-search-engine.test.js`.
