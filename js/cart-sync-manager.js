/**
 * LocalStorage Cart Persistence with Expiration & Sync Manager Module.
 * Manages shopping cart items in LocalStorage with a 24-hour TTL expiration purge and cross-tab sync (#3706).
 */

export class CartSyncManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'cara_shopping_cart';
    this.ttlMs = options.ttlMs || 24 * 60 * 60 * 1000; // 24 hours
    this.initSync();
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
      return data ? JSON.parse(data) : null;
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
    const payload = {
      items,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save cart payload:', e);
    }
  }

  addItem(item) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity =
        (cart[existingIndex].quantity || 1) + (item.quantity || 1);
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

function shouldCompressPayload(payload) {
  return typeof payload === 'string' && payload.length > 500;
}
