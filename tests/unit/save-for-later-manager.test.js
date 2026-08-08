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
});
