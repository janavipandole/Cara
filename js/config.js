/**
 * Shared frontend config loaded early by most HTML pages.
 * Values mirror the defaults also set in app.js so pages that do not
 * load app.js still get API base URL, tax/shipping, and coupon codes.
 */
(() => {
  if (typeof window.CARA_API_BASE_URL === 'undefined') {
    window.CARA_API_BASE_URL = '';
  }

  window.CARA_CONFIG = window.CARA_CONFIG || {
    TAX_RATE: 0.18,
    SHIPPING: {
      FEE: 150,
      FREE_THRESHOLD: 3000,
      EXPRESS_FEE: 150,
      INTERNATIONAL_FEE: 450,
      STORAGE_KEY: 'cara_shipping_method',
    },
    URGENCY_DISCOUNT_PCT: 0.05,
    GIFT_WRAP_CHARGE: 99,
    LOYALTY: {
      POINTS_PER_RUPEE: 10,
      DEFAULT_BALANCE: 150,
    },
  };

  // Shared shipping logic: the cart estimator, the cart summary and the
  // checkout summary all charge the same fee the backend applies. The chosen
  // delivery method is persisted so it survives navigation from cart to
  // checkout, and is submitted with the order via OrderCreate.shipping_method.
  window.CaraShipping = {
    METHODS: ['standard', 'express', 'international'],

    getMethod() {
      const key = window.CARA_CONFIG.SHIPPING.STORAGE_KEY;
      try {
        const method = String(localStorage.getItem(key) || 'standard').toLowerCase();
        return this.METHODS.includes(method) ? method : 'standard';
      } catch (err) {
        return 'standard';
      }
    },

    setMethod(method) {
      const key = window.CARA_CONFIG.SHIPPING.STORAGE_KEY;
      const normalized = String(method || 'standard').toLowerCase();
      try {
        localStorage.setItem(
          key,
          this.METHODS.includes(normalized) ? normalized : 'standard',
        );
      } catch (err) {
        // Ignore storage failures in restricted environments.
      }
    },

    computeFee(subtotal) {
      const cfg = window.CARA_CONFIG.SHIPPING;
      const subtotalNum = Number(subtotal) || 0;
      let fee = subtotalNum >= cfg.FREE_THRESHOLD ? 0 : cfg.FEE;
      const method = this.getMethod();
      if (method === 'express') fee += cfg.EXPRESS_FEE;
      else if (method === 'international') fee += cfg.INTERNATIONAL_FEE;
      return fee;
    },
  };

  window.CARA_COUPONS = window.CARA_COUPONS || {
    CARA20: 20,
    WELCOME10: 10,
  };
})();
