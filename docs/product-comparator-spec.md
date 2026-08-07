# Interactive Product Comparator Specification

## Overview
The `InteractiveProductComparator` handles comparison grid state management, localStorage persistence, difference detection across attributes, and capacity constraints (max 4 products).

## API Usage
```javascript
const comparator = new InteractiveProductComparator();

// Add product
comparator.addItem({ id: 1, name: 'Cotton Shirt', price: 49.99, brand: 'Cara' });

// Get attribute differences
const differences = comparator.getDifferences(); // ['price', ...]

// Remove item
comparator.removeItem(1);
```

## Unit Test Suite
Located in `tests/unit/interactive-product-comparator.test.js`.
