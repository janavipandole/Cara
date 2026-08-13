/**
 * Real-Time Multi-Tab BroadcastChannel Cart Synchronization & Conflict Resolution Engine
 * 
 * Synchronizes shopping cart state, quantity changes, and applied coupons in real-time
 * across all open browser tabs using the BroadcastChannel API with localStorage fallbacks.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.CartSyncManager = exports.CartSyncManager;
    root.shouldCompressPayload = exports.shouldCompressPayload;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function shouldCompressPayload(payload) {
    return typeof payload === 'string' && payload.length > 500;
  }

  function calculateStateHash(items = [], coupon = null) {
    const str = JSON.stringify({ items, coupon });
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  class CartSyncManager {
    constructor(options = {}) {
      this.storageKey = options.storageKey || 'cara_shopping_cart';
      this.channelName = options.channelName || 'cara_cart_channel';
      this.ttlMs = options.ttlMs || 24 * 60 * 60 * 1000; // 24 hours
      this.maxItemQuantity = options.maxItemQuantity || 99;
      this.tabId = 'tab_' + Math.random().toString(36).substring(2, 9);
      this.vectorClock = 0;
      this.onCartSyncCallback = null;

      this.initBroadcastChannel();
      this.initLocalStorageFallback();
    }

    initBroadcastChannel() {
      if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
        try {
          this.channel = new window.BroadcastChannel(this.channelName);
          this.channel.onmessage = (event) => this.handleBroadcastMessage(event.data);
        } catch (e) {
          this.channel = null;
        }
      }
    }

    initLocalStorageFallback() {
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('storage', (event) => {
          if (event.key === this.storageKey) {
            const currentCart = this.getCart();
            this.notifySync(currentCart, 'STORAGE_EVENT');
          }
        });
      }
    }

    handleBroadcastMessage(msg) {
      if (!msg || msg.senderTabId === this.tabId) return;

      if (msg.vectorClock && msg.vectorClock > this.vectorClock) {
        this.vectorClock = msg.vectorClock;
      }

      const cart = this.getCart();
      this.notifySync(cart, msg.type || 'REMOTE_UPDATE', msg);

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('cara:cart-synced', {
            detail: { type: msg.type, senderTabId: msg.senderTabId, cart },
          })
        );
      }
    }

    broadcastMutation(type, payload = {}) {
      this.vectorClock++;
      const message = {
        type,
        senderTabId: this.tabId,
        vectorClock: this.vectorClock,
        timestamp: Date.now(),
        payload,
      };

      if (this.channel) {
        try {
          this.channel.postMessage(message);
        } catch (e) {
          // ignore postMessage error
        }
      }
    }

    onSync(callback) {
      this.onCartSyncCallback = callback;
    }

    notifySync(cart, eventType = 'SYNC', detail = {}) {
      if (typeof this.onCartSyncCallback === 'function') {
        this.onCartSyncCallback(cart, eventType, detail);
      }
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

    getAppliedCoupon() {
      const raw = this.getCartData();
      return raw ? raw.coupon || null : null;
    }

    saveCart(items = [], coupon = null) {
      if (typeof localStorage === 'undefined') return;

      // Conflict Resolution: Cap any item quantity at maxItemQuantity
      const resolvedItems = items.map((item) => ({
        ...item,
        quantity: Math.min(Math.max(1, item.quantity || 1), this.maxItemQuantity),
      }));

      const now = Date.now();
      const payload = {
        items: resolvedItems,
        coupon: coupon !== undefined ? coupon : this.getAppliedCoupon(),
        timestamp: now,
        expiresAt: now + this.ttlMs,
        vectorClock: this.vectorClock,
        stateHash: calculateStateHash(resolvedItems, coupon),
      };

      try {
        localStorage.setItem(this.storageKey, JSON.stringify(payload));
      } catch (e) {
        console.warn('Failed to save cart payload:', e);
      }
    }

    addItem(item) {
      const cart = this.getCart();
      const hasId = item.id != null;
      const existingIndex = hasId ? cart.findIndex((i) => i.id === item.id) : -1;

      if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + (item.quantity || 1);
      } else {
        cart.push({ ...item, quantity: item.quantity || 1 });
      }

      this.saveCart(cart);
      this.broadcastMutation('ITEM_ADDED', { item });
      return cart;
    }

    removeItem(itemId) {
      let cart = this.getCart();
      cart = cart.filter((i) => i.id !== itemId);
      this.saveCart(cart);
      this.broadcastMutation('ITEM_REMOVED', { itemId });
      return cart;
    }

    updateQuantity(itemId, quantity) {
      let cart = this.getCart();
      const existingIndex = cart.findIndex((i) => i.id === itemId);
      if (existingIndex > -1) {
        if (quantity <= 0) {
          cart.splice(existingIndex, 1);
        } else {
          cart[existingIndex].quantity = Math.min(quantity, this.maxItemQuantity);
        }
        this.saveCart(cart);
        this.broadcastMutation('QUANTITY_CHANGED', { itemId, quantity });
      }
      return cart;
    }

    applyCoupon(couponCode) {
      const cart = this.getCart();
      this.saveCart(cart, couponCode);
      this.broadcastMutation('COUPON_APPLIED', { couponCode });
      return couponCode;
    }

    clearCart() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {
        // ignore
      }
      this.broadcastMutation('CART_CLEARED', {});
    }

    destroy() {
      if (this.channel) {
        try {
          this.channel.close();
        } catch (e) {
          // ignore
        }
      }
    }
  }

  return {
    CartSyncManager,
    shouldCompressPayload,
  };
});