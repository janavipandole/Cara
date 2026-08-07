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

  it('should truncate long notes to 300 characters', () => {
    const longNote = 'x'.repeat(400);
    const res = manager.addNote('product-301', longNote);
    expect(res.success).toBe(true);
    const meta = manager.getProductMeta('product-301');
    expect(meta.note.length).toBe(300);
  });

  it('should normalize tag case and trim whitespace', () => {
    manager.addTags('product-302', ['  Summer  ', 'CASUAL']);
    const meta = manager.getProductMeta('product-302');
    expect(meta.tags).toContain('summer');
    expect(meta.tags).toContain('casual');
  });

  it('should reject invalid note and tag input', () => {
    expect(manager.addNote('product-303', 42).success).toBe(false);
    expect(manager.addTags('product-303', 'not-an-array').success).toBe(false);
    expect(manager.getProductMeta('product-303')).toBeNull();
  });

  it('should clamp negative priority values to 0', () => {
    const res = manager.setPriority('product-304', -5);
    expect(res.priority).toBe(0);
  });
});
