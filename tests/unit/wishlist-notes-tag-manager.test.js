import { describe, it, expect, beforeEach } from 'vitest';
const WishlistNotesTagManager = require('../../js/wishlist-notes-tag-manager.js');

describe('WishlistNotesTagManager Unit Tests', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    manager = new WishlistNotesTagManager();
  });

  it('should add and retrieve a note for a product', () => {
    const res = manager.addNote('product-123', 'Perfect for summer');
    expect(res.success).toBe(true);
    const meta = manager.getProductMeta('product-123');
    expect(meta.note).toBe('Perfect for summer');
  });

  it('should add tags and prevent duplicates', () => {
    manager.addTags('product-456', ['summer', 'casual', 'summer']);
    const meta = manager.getProductMeta('product-456');
    expect(meta.tags).toContain('summer');
    expect(meta.tags.filter((t) => t === 'summer').length).toBe(1);
  });

  it('should set priority within valid range 0-5', () => {
    const res = manager.setPriority('product-789', 3);
    expect(res.priority).toBe(3);

    const over = manager.setPriority('product-789', 99);
    expect(over.priority).toBe(5);
  });

  it('should filter products by specific tag', () => {
    manager.addTags('product-100', ['gift']);
    manager.addTags('product-200', ['birthday', 'gift']);
    const filtered = manager.filterByTag('gift');
    expect(filtered.length).toBe(2);
  });
});
