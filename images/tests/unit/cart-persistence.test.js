/**
 * Unit tests for the cart persistence helpers in app.js.
 * Pins the localStorage round-trip behaviour of saveCart / loadCartFromStorage
 * / clearCart (issue #7069). Follows the repo convention of replicating the
 * IIFE-local helpers, the same way cart-race-condition.test.js does.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const CART_STORAGE_KEY = 'productsInCart';

// Replicas of the helpers added to app.js.
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart || []));
    window.cachedCartState = cart || [];
  } catch (err) {
    window.logError('Failed to persist cart:', err);
  }
}

function loadCartFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (err) {
    window.logError('Failed to load cart from storage:', err);
    return [];
  }
}

function clearCart() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (err) {
    window.logError('Failed to clear cart from storage:', err);
  }
  window.cachedCartState = [];
}

describe('Cart Persistence (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.cachedCartState = null;
    window.logError = vi.fn();
  });

  it('persists the cart and restores it after a simulated page reload', () => {
    const cart = [
      { id: 1, name: 'Tropical Hibiscus Shirt', quantity: 2, size: 'M' },
    ];
    saveCart(cart);

    // Simulate a page reload: fresh in-memory state, no cache.
    window.cachedCartState = null;
    expect(loadCartFromStorage()).toEqual(cart);
  });

  it('accumulates quantity for duplicate items across reloads', () => {
    saveCart([{ id: 1, name: 'Shirt', quantity: 2, size: 'M' }]);

    const reloaded = loadCartFromStorage();
    const existing = reloaded.find((p) => p.id === 1 && p.size === 'M');
    existing.quantity += 1;
    saveCart(reloaded);

    expect(loadCartFromStorage()[0].quantity).toBe(3);
  });

  it('returns an empty array when nothing has been stored', () => {
    expect(loadCartFromStorage()).toEqual([]);
  });

  it('does not throw and returns [] when storage holds corrupt JSON', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{not valid json');

    expect(() => loadCartFromStorage()).not.toThrow();
    expect(loadCartFromStorage()).toEqual([]);
    expect(window.logError).toHaveBeenCalled();
  });

  it('returns [] when the stored value is not an array', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ bogus: true }));

    expect(loadCartFromStorage()).toEqual([]);
  });

  it('clears the persisted cart and resets the cache', () => {
    saveCart([{ id: 1, name: 'Shirt', quantity: 1, size: 'M' }]);

    clearCart();

    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    expect(window.cachedCartState).toEqual([]);
    expect(loadCartFromStorage()).toEqual([]);
  });

  it('does not throw when localStorage writes fail', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    expect(() =>
      saveCart([{ id: 1, name: 'Shirt', quantity: 1 }]),
    ).not.toThrow();
    expect(window.logError).toHaveBeenCalled();

    setItemSpy.mockRestore();
  });
});
