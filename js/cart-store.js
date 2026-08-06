/**
 * Canonical cart localStorage store.
 * One key, schema versioning, and one-time migration from legacy keys.
 */
(function (root) {
  'use strict';

  const CART_KEY = 'productsInCart';
  const SCHEMA_VERSION = 1;
  const LEGACY_KEYS = ['cara_shopping_cart', 'cara_cart'];

  function safeParse(raw, fallback) {
    try {
      return raw == null ? fallback : JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function normalizeItems(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.items)) return raw.items;
    if (raw && typeof raw === 'object') {
      // cara.html historically stored a map of id -> qty/item
      return Object.keys(raw)
        .filter((k) => k !== 'subtotal' && k !== 'version' && k !== 'timestamp')
        .map((id) => {
          const entry = raw[id];
          if (entry && typeof entry === 'object') {
            return { id, ...entry, quantity: entry.quantity || entry.qty || 1 };
          }
          return { id, quantity: Number(entry) || 1 };
        });
    }
    return [];
  }

  function readLegacyItems() {
    if (typeof localStorage === 'undefined') return [];
    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = safeParse(raw, null);
      const items = normalizeItems(parsed);
      if (items.length) return items;
    }
    return [];
  }

  function migrateIfNeeded() {
    if (typeof localStorage === 'undefined') return;
    const existing = localStorage.getItem(CART_KEY);
    if (existing) {
      const parsed = safeParse(existing, []);
      if (Array.isArray(parsed) && parsed.length) return;
    }
    const legacyItems = readLegacyItems();
    if (!legacyItems.length) return;
    writeCart(legacyItems);
    for (const key of LEGACY_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        // ignore
      }
    }
  }

  function readCart() {
    migrateIfNeeded();
    if (typeof localStorage === 'undefined') return [];
    return normalizeItems(safeParse(localStorage.getItem(CART_KEY), []));
  }

  function writeCart(items) {
    if (typeof localStorage === 'undefined') return;
    const list = Array.isArray(items) ? items : [];
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(list));
      // Keep a version marker for future migrations without breaking array readers.
      localStorage.setItem(
        'cara_cart_meta',
        JSON.stringify({ version: SCHEMA_VERSION, updatedAt: Date.now() }),
      );
      // Mirror cleared legacy keys so stale writers do not resurrect forks.
      for (const key of LEGACY_KEYS) {
        localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn('Failed to persist cart:', err);
    }
    if (typeof root !== 'undefined') {
      root.cachedCartState = list;
    }
  }

  function clearCart() {
    writeCart([]);
    try {
      localStorage.removeItem(CART_KEY);
    } catch (err) {
      // ignore
    }
  }

  function cartSubtotal(items) {
    const list = items || readCart();
    return list.reduce((sum, item) => {
      const price = Number(String(item.price || 0).toString().replace(/[^\d.]/g, '')) || 0;
      const qty = parseInt(item.quantity, 10) || 1;
      return sum + price * qty;
    }, 0);
  }

  const api = {
    KEY: CART_KEY,
    LEGACY_KEYS,
    SCHEMA_VERSION,
    readCart,
    writeCart,
    clearCart,
    cartSubtotal,
    migrateIfNeeded,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.CaraCartStore = api;
})(typeof window !== 'undefined' ? window : globalThis);
