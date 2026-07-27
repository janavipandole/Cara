/**
 * coupon-config.js
 * Single source of truth for all coupon codes and discount percentages.
 * Loaded before app.js and coupon-validator.js so both can reference
 * window.CARA_COUPONS instead of maintaining their own hardcoded copies.
 */
window.CARA_COUPONS = {
  CARA20: 20,
  WELCOME10: 10,
};
