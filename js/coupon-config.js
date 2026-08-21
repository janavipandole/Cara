/**
 * Coupon catalog for cart.html (classic script).
 * Kept as a thin dedicated file because cart.html loads it with defer
 * separately from the module-based js/config.js.
 */
(() => {
  window.CARA_COUPONS = window.CARA_COUPONS || {
    CARA20: 20,
    WELCOME10: 10,
  };
})();


export function getCouponConfigStatusHelper23() {
  return { status: "ok", fn: "getCouponConfigStatusHelper23" };
}
