import { describe, it, expect, beforeEach } from 'vitest';
import { WishlistNotesTagManager } from '../../js/wishlist-notes-tag-manager.js';

describe('WishlistNotesTagManager', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('sets notes and adds tags to wishlist item', () => {
    const manager = new WishlistNotesTagManager({ storageKey: 'test_notes' });
    manager.setNote('prod_101', 'Gift for birthday');
    manager.addTag('prod_101', 'Gift');
    manager.addTag('prod_101', 'Summer');

    const meta = manager.getItemMeta('prod_101');
    expect(meta.notes).toBe('Gift for birthday');
    expect(meta.tags).toEqual(['gift', 'summer']);
  });

  it('removes specific tags from wishlist item', () => {
    const manager = new WishlistNotesTagManager({ storageKey: 'test_notes' });
    manager.addTag('prod_101', 'Gift');
    manager.addTag('prod_101', 'Summer');
    manager.removeTag('prod_101', 'Gift');

    const meta = manager.getItemMeta('prod_101');
    expect(meta.tags).toEqual(['summer']);
  });

  it('configures target price alert thresholds', () => {
    const manager = new WishlistNotesTagManager({ storageKey: 'test_notes' });
    manager.setTargetPriceAlert('prod_101', 39.99);

    const meta = manager.getItemMeta('prod_101');
    expect(meta.targetPriceAlert).toBe(39.99);
  });

  it('filters product IDs matching a specific tag', () => {
    const manager = new WishlistNotesTagManager({ storageKey: 'test_notes' });
    manager.addTag('p1', 'work');
    manager.addTag('p2', 'vacation');
    manager.addTag('p3', 'work');

    const workItems = manager.filterByTag('work');
    expect(workItems).toEqual(['p1', 'p3']);
  });
});
