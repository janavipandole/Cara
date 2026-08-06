/**
 * LocalStorage Cart Persistence with Expiration & Sync Manager Module.
 * Manages shopping cart items in LocalStorage with a 24-hour TTL expiration purge and cross-tab sync (#3706).
 */

export class CartSyncManager {
  constructor(options = {}) {
    // Canonical key shared with app.js / checkout (migrates legacy keys).
    this.storageKey = options.storageKey || 'productsInCart';
    this.ttlMs = options.ttlMs || 24 * 60 * 60 * 1000; // 24 hours
    this._migrateLegacy();
    this.initSync();
  }

  _migrateLegacy() {
    if (typeof window !== 'undefined' && window.CaraCartStore) {
      window.CaraCartStore.migrateIfNeeded();
      return;
    }
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(this.storageKey)) return;
    for (const key of ['cara_shopping_cart', 'cara_cart']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.items)
            ? parsed.items
            : [];
        if (items.length) {
          this.saveCart(items);
          localStorage.removeItem(key);
          break;
        }
      } catch (e) {
        // ignore bad legacy payload
      }
    }
  }

  initSync() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (event) => {
        if (event.key === this.storageKey && this.onCartSyncCallback) {
          this.onCartSyncCallback(this.getCart());
        }
      });
    }
  }

  onSync(callback) {
    this.onCartSyncCallback = callback;
  }

  getCartData() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      const parsed = JSON.parse(data);
      const metaRaw = localStorage.getItem(`${this.storageKey}_meta`);
      let metaTs = Date.now();
      if (metaRaw) {
        try {
          metaTs = JSON.parse(metaRaw).updatedAt || metaTs;
        } catch (e) {
          // ignore
        }
      }
      // Canonical store is a bare array; wrap for TTL helpers.
      if (Array.isArray(parsed)) {
        return { items: parsed, timestamp: metaTs };
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  getCart() {
    const raw = this.getCartData();
    if (!raw) return [];

    const now = Date.now();
    if (raw.timestamp && now - raw.timestamp > this.ttlMs) {
      this.clearCart();
      return [];
    }

    return Array.isArray(raw.items) ? raw.items : [];
  }

  saveCart(items = []) {
    if (typeof localStorage === 'undefined') return;
    try {
      // Persist as the canonical array shape used by app.js / checkout.
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      localStorage.setItem(
        `${this.storageKey}_meta`,
        JSON.stringify({ version: 1, updatedAt: Date.now() }),
      );
      localStorage.removeItem('cara_shopping_cart');
      localStorage.removeItem('cara_cart');
    } catch (e) {
      console.warn('Failed to save cart payload:', e);
    }
  }

  addItem(item) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + (item.quantity || 1);
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    this.saveCart(cart);
    return cart;
  }

  removeItem(itemId) {
    let cart = this.getCart();
    cart = cart.filter((i) => i.id !== itemId);
    this.saveCart(cart);
    return cart;
  }

  clearCart() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      // ignore
    }
  }
}


function shouldCompressPayload(payload) { return typeof payload === 'string' && payload.length > 500; }