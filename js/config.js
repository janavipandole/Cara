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
    },
    URGENCY_DISCOUNT_PCT: 0.05,
    GIFT_WRAP_CHARGE: 99,
    LOYALTY: {
      POINTS_PER_RUPEE: 10,
      DEFAULT_BALANCE: 150,
    },
    // Site-wide sales auto-applied to matching product categories at checkout.
    // Promo codes are exclusive and can NEVER stack on top of these
    // ("Best Offer Only", #6296).
    SITE_WIDE_SALES: {
      formal: 20,
    },
  };

  window.CARA_COUPONS = window.CARA_COUPONS || {
    CARA20: 20,
    WELCOME10: 10,
  };
})();
