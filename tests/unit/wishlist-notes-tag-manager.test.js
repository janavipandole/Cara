import { describe, it, expect, beforeEach } from 'vitest';
import WishlistNotesTagManager from '../../js/wishlist-notes-tag-manager.js';

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

  it('should cap the tag list at 10 entries', () => {
    const manyTags = Array.from({ length: 15 }, (_, i) => `tag-${i}`);
    manager.addTags('product-305', manyTags);
    const meta = manager.getProductMeta('product-305');
    expect(meta.tags.length).toBe(10);
  });

  it('should truncate individual tags to 20 characters', () => {
    manager.addTags('product-306', ['x'.repeat(50)]);
    const meta = manager.getProductMeta('product-306');
    expect(meta.tags[0].length).toBe(20);
  });

  it('should merge new tags with existing ones without duplicates', () => {
    manager.addTags('product-307', ['summer', 'gift']);
    manager.addTags('product-307', ['gift', 'winter']);
    const meta = manager.getProductMeta('product-307');
    expect(meta.tags).toEqual(['summer', 'gift', 'winter']);
  });

  it('should remove a specified tag from a product', () => {
    manager.addTags('product-308', ['summer', 'gift', 'casual']);
    const res = manager.removeTag('product-308', 'gift');
    expect(res.success).toBe(true);
    const meta = manager.getProductMeta('product-308');
    expect(meta.tags).toEqual(['summer', 'casual']);
  });
});
