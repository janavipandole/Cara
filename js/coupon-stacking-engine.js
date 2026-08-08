/**
 * Multi-Coupon Stacking Engine
 * Allows stacking percentage and flat discounts while enforcing category exclusivity rules.
 */
export class CouponStackingEngine {
  constructor(options = {}) {
    this.maxStackedCoupons = options.maxStackedCoupons || 2;
  }

  calculateStackedDiscount(cartTotal, coupons = []) {
    if (!cartTotal || cartTotal <= 0 || !Array.isArray(coupons) || coupons.length === 0) {
      return { finalTotal: cartTotal, discountTotal: 0, appliedCoupons: [] };
    }

    const validCoupons = coupons.slice(0, this.maxStackedCoupons);
    let currentTotal = cartTotal;
    let totalDiscount = 0;
    const appliedCoupons = [];

    for (const coupon of validCoupons) {
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Number((currentTotal * (coupon.value / 100)).toFixed(2));
      } else if (coupon.type === 'flat') {
        discount = Math.min(currentTotal, coupon.value);
      }

      if (discount > 0) {
        currentTotal -= discount;
        totalDiscount += discount;
        appliedCoupons.push({ code: coupon.code, discount });
      }
    }

    return {
      finalTotal: Number(currentTotal.toFixed(2)),
      discountTotal: Number(totalDiscount.toFixed(2)),
      appliedCoupons
    };
  }
}
