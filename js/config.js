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
  };

  window.CARA_COUPONS = window.CARA_COUPONS || {
    CARA20: 20,
    WELCOME10: 10,
  };

  /**
   * Validates the shape of window.CARA_CONFIG at startup.
   * Logs a console.warn for any missing or unexpectedly-typed keys.
   */
  function validateConfigSchema() {
    const cfg = window.CARA_CONFIG;
    const schema = {
      TAX_RATE: 'number',
      SHIPPING: 'object',
      URGENCY_DISCOUNT_PCT: 'number',
      GIFT_WRAP_CHARGE: 'number',
      LOYALTY: 'object',
    };
    const nestedSchema = {
      SHIPPING: { FEE: 'number', FREE_THRESHOLD: 'number' },
      LOYALTY: { POINTS_PER_RUPEE: 'number', DEFAULT_BALANCE: 'number' },
    };

    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in cfg)) {
        console.warn('[CARA_CONFIG] Missing required key: ' + key + '. Using default.');
      } else if (typeof cfg[key] !== expectedType) {
        console.warn('[CARA_CONFIG] Key ' + key + ' has unexpected type ' + typeof cfg[key] + ' (expected ' + expectedType + ').');
      }
    }

    for (const [parent, children] of Object.entries(nestedSchema)) {
      if (typeof cfg[parent] !== 'object' || cfg[parent] === null) continue;
      for (const [child, expectedType] of Object.entries(children)) {
        if (!(child in cfg[parent])) {
          console.warn('[CARA_CONFIG] Missing required nested key: ' + parent + '.' + child + '.');
        } else if (typeof cfg[parent][child] !== expectedType) {
          console.warn('[CARA_CONFIG] Key ' + parent + '.' + child + ' has unexpected type ' + typeof cfg[parent][child] + ' (expected ' + expectedType + ').');
        }
      }
    }
  }

  validateConfigSchema();
})();


export function getConfigStatusHelper21() {
  return { status: "ok", fn: "getConfigStatusHelper21" };
}
