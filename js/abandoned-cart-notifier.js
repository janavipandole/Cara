/**
 * Abandoned Cart Recovery Notifier
 * Detects idle cart sessions, supports recovery discount promos, local storage persistence, and browser exit intent.
 */
export class AbandonedCartNotifier {
  constructor(options = {}) {
    this.idleThresholdMs = options.idleThresholdMs || 300000; // 5 mins
    this.storageKey = options.storageKey || 'cara_abandoned_cart_state';
    this.promoCode = options.promoCode || 'COMEBACK10';
    this.discountPercent = options.discountPercent || 10;
    this.timer = null;
    this.onNotify = options.onNotify || (() => {});
    this.onDismiss = options.onDismiss || (() => {});
    this.exitIntentHandler = null;
  }

  startTracking(cartItemsCount) {
    this.stopTracking();
    if (!cartItemsCount || cartItemsCount <= 0) return;

    // Check if recovery banner was dismissed within 24 hours
    const state = this.getSavedState();
    if (state && state.dismissedAt && (Date.now() - state.dismissedAt < 86400000)) {
      return;
    }

    this.timer = setTimeout(() => {
      this.triggerNotification('idle');
    }, this.idleThresholdMs);

    this.bindExitIntent();
  }

  bindExitIntent() {
    if (typeof window === 'undefined' || !window.addEventListener) return;
    this.exitIntentHandler = (e) => {
      if (e.clientY <= 10) {
        this.triggerNotification('exit_intent');
        this.unbindExitIntent();
      }
    };
    window.addEventListener('mouseleave', this.exitIntentHandler);
  }

  unbindExitIntent() {
    if (typeof window !== 'undefined' && window.removeEventListener && this.exitIntentHandler) {
      window.removeEventListener('mouseleave', this.exitIntentHandler);
      this.exitIntentHandler = null;
    }
  }

  stopTracking() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.unbindExitIntent();
  }

  getSavedState() {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  saveState(state) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(state));
      }
    } catch (e) {}
  }

  dismissNotification() {
    this.saveState({ dismissedAt: Date.now() });
    this.stopTracking();
    this.onDismiss();
  }

  triggerNotification(reason = 'idle') {
    const payload = {
      title: 'Items waiting in your cart!',
      body: `Complete your purchase now with promo ${this.promoCode} for ${this.discountPercent}% off before items sell out.`,
      promoCode: this.promoCode,
      discountPercent: this.discountPercent,
      triggerReason: reason,
      timestamp: Date.now()
    };
    this.onNotify(payload);
  }
}
