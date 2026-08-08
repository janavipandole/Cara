import { describe, it, expect, beforeEach } from 'vitest';
import { SaveForLaterManager } from '../../js/save-for-later-manager.js';

describe('SaveForLaterManager', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    manager = new SaveForLaterManager('test_saved');
  });

  it('saves item to localStorage list', () => {
    manager.saveItem({ id: 'p1', name: 'Hoodie' });
    expect(manager.getSavedItems().length).toBe(1);
  });

  it('moves item from saved list back to active cart', () => {
    manager.saveItem({ id: 'p1', name: 'Hoodie' });
    const cart = [];
    const moved = manager.moveToCart('p1', cart);
    expect(moved.name).toBe('Hoodie');
    expect(cart.length).toBe(1);
    expect(manager.getSavedItems().length).toBe(0);
  });

  it('rejects saving an item without an id', () => {
    expect(manager.saveItem({ name: 'No Id' })).toBe(false);
    expect(manager.saveItem(null)).toBe(false);
    expect(manager.getSavedItems().length).toBe(0);
  });

  it('does not save duplicate items with the same id', () => {
    expect(manager.saveItem({ id: 'p1', name: 'Hoodie' })).toBe(true);
    expect(manager.saveItem({ id: 'p1', name: 'Hoodie' })).toBe(false);
    expect(manager.getSavedItems().length).toBe(1);
  });

  it('returns null when moving an unknown item id', () => {
    manager.saveItem({ id: 'p1' });
    expect(manager.moveToCart('does-not-exist', [])).toBeNull();
  });

  it('recovers from corrupt storage gracefully', () => {
    localStorage.setItem('test_saved', '{corrupt-json');
    expect(manager.getSavedItems()).toEqual([]);
    expect(manager.saveItem({ id: 'p2' })).toBe(true);
  });
});
