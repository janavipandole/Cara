# Wishlist Notes & Tag Manager Architecture

## Overview
`WishlistNotesTagManager` allows users to attach personal notes, custom tags (up to 10 per item), and priority ratings (0–5) to wishlist items, persisted in `localStorage`.

## API Summary
```javascript
const manager = new WishlistNotesTagManager();

manager.addNote('product-123', 'Gift for birthday');
manager.addTags('product-123', ['gift', 'luxury']);
manager.setPriority('product-123', 4);

// Filter by tag
const gifts = manager.filterByTag('gift');
```

## Unit Test Coverage
Tested via Vitest in `tests/unit/wishlist-notes-tag-manager.test.js`.
