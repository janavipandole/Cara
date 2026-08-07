/**
 * Cart Recovery & Cross-Tab Persistence Engine
 * Manages abandoned cart sessions, prompt banners, and cross-tab synchronization.
 */

export class CartRecoveryEngine {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'cara_abandoned_cart';
    this.sessionTimeoutMs = options.sessionTimeoutMs || 15 * 60 * 1000; // 15 minutes
    this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cara_cart_sync') : null;
    this.initListeners();
  }

  initListeners() {
    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'CART_UPDATED') {
          this.handleExternalCartUpdate(event.data.cart);
        }
      };
    }
  }

  saveCartSession(cartItems, couponCode = '') {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      localStorage.removeItem(this.storageKey);
      return false;
    }
    const sessionData = {
      items: cartItems,
      coupon: couponCode,
      timestamp: Date.now(),
      recovered: false
    };
    localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    if (this.channel) {
      this.channel.postMessage({ type: 'CART_UPDATED', cart: sessionData });
    }
    return true;
  }

  getAbandonedCartSession() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.recovered) return null;

      // Reject sessions whose items are not a valid array (corrupt/legacy shape).
      if (!Array.isArray(data.items)) return null;

      const age = Date.now() - (data.timestamp || 0);
      if (age > this.sessionTimeoutMs) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  markAsRecovered() {
    const session = this.getAbandonedCartSession();
    if (session) {
      session.recovered = true;
      localStorage.setItem(this.storageKey, JSON.stringify(session));
      return true;
    }
    return false;
  }

  handleExternalCartUpdate(cartData) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cara:cart-synced', { detail: cartData }));
    }
  }

  renderRecoveryBanner(containerId = 'cart-recovery-banner') {
    if (typeof document === 'undefined') return null;
    const session = this.getAbandonedCartSession();
    if (!session) return null;

    let banner = document.getElementById(containerId);
    if (!banner) {
      banner = document.createElement('div');
      banner.id = containerId;
      banner.className = 'cart-recovery-banner';
      document.body.prepend(banner);
    }

    const itemCount = session.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    banner.innerHTML = `
      <div class="cart-recovery-content">
        <span class="cart-recovery-text">
          🛒 You left <strong>${itemCount} item(s)</strong> in your shopping cart.
        </span>
        <div class="cart-recovery-actions">
          <button id="btn-restore-cart" class="btn-restore">Restore Cart</button>
          <button id="btn-dismiss-cart" class="btn-dismiss">&times;</button>
        </div>
      </div>
    `;

    document.getElementById('btn-restore-cart')?.addEventListener('click', () => {
      this.markAsRecovered();
      banner.remove();
      window.dispatchEvent(new CustomEvent('cara:restore-cart', { detail: session }));
    });

    document.getElementById('btn-dismiss-cart')?.addEventListener('click', () => {
      this.markAsRecovered();
      banner.remove();
    });

    return banner;
  }
}


export function getAbandonedCartGuard(items) { return Array.isArray(items) ? items : []; }