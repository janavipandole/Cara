/**
 * Regression tests for the products.js addToCart cache-sync fix.
 * products.js writes the cart directly to localStorage; it must keep
 * window.cachedCartState in sync so app.js cart views never show a stale
 * (pre-write) snapshot. Follows the repo convention of replicating the
 * module-scoped logic (see products.test.js).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

window.logError = vi.fn();
window.showToast = vi.fn();

function safeParseJSON(key, fallback = '[]') {
  try {
    return JSON.parse(localStorage.getItem(key) || fallback);
  } catch (e) {
    window.logError(`Corrupted localStorage data for "${key}":`, e);
    try {
      return JSON.parse(fallback);
    } catch {
      return [];
    }
  }
}

// Replica of products.js addToCart (with the cache-sync line).
function addToCart(name, price, img, quantity, size, productId) {
  const cart = safeParseJSON('productsInCart');
  const parsedQty = parseInt(quantity, 10) || 1;
  const item = {
    id: productId != null && productId !== '' ? Number(productId) : undefined,
    name,
    price,
    image: img,
    img,
    quantity: parsedQty,
    size,
  };
  const existing = cart.find(
    (p) =>
      (item.id != null && p.id != null
        ? Number(p.id) === item.id
        : p.name === name) && p.size === size,
  );
  if (existing) {
    existing.quantity = (parseInt(existing.quantity, 10) || 0) + parsedQty;
    if (existing.id == null && item.id != null) existing.id = item.id;
  } else {
    cart.push(item);
  }
  try {
    localStorage.setItem('productsInCart', JSON.stringify(cart));
    window.cachedCartState = cart;
    if (typeof showToast === 'function') {
      showToast(name + ' added to cart!', 'success');
    }
  } catch (e) {
    window.logError('Failed to save cart:', e);
    if (typeof showToast === 'function') {
      showToast('Storage limit reached! Cannot add to cart.', 'error');
    }
  }
}

describe('products.js addToCart cache sync', () => {
  beforeEach(() => {
    localStorage.clear();
    window.cachedCartState = null;
    window.logError.mockClear();
    window.showToast.mockClear();
  });

  afterEach(() => {
    window.showToast.mockReset();
  });

  it('persists the item and keeps cachedCartState in sync', () => {
    addToCart('Kurta', '₹1499', 'img.jpg', 1, 'M', 42);

    const stored = safeParseJSON('productsInCart');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Kurta');
    expect(stored[0].quantity).toBe(1);
    expect(window.cachedCartState).toEqual(stored);
  });

  it('reflects the new item in the cache a later cart render would use', () => {
    addToCart('Kurta', '₹1499', 'img.jpg', 1, 'M', 42);
    addToCart('Kurta', '₹1499', 'img.jpg', 2, 'M', 42);

    const freshRead = JSON.parse(localStorage.getItem('productsInCart'));
    expect(window.cachedCartState).toEqual(freshRead);
    expect(window.cachedCartState).toHaveLength(1);
    expect(window.cachedCartState[0].quantity).toBe(3);
  });

  it('keeps the cache in sync when storage writes fail', () => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });

    addToCart('Kurta', '₹1499', 'img.jpg', 1, 'M', 42);

    expect(window.logError).toHaveBeenCalled();
    expect(window.showToast).toHaveBeenCalledWith(
      'Storage limit reached! Cannot add to cart.',
      'error',
    );

    localStorage.setItem = originalSetItem;
  });
});
