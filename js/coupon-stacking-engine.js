/**
 * Coupon Stacking Engine
 * Handles stackable promotions, minimum subtotals, category exclusivity, free shipping, and global percentage caps.
 */
export class CouponStackingEngine {
  constructor(options = {}) {
    this.maxGlobalDiscountPct = options.maxGlobalDiscountPct || 50; // Cap max total discount at 50%
  }

  evaluateCoupon(coupon, cartItems, subtotal) {
    if (!coupon || !coupon.code) {
      return { valid: false, reason: 'Invalid coupon object' };
    }

    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      return { valid: false, reason: `Minimum order amount of $${coupon.minSubtotal} required` };
    }

    // Check category restrictions if applicable
    let eligibleSubtotal = subtotal;
    if (coupon.targetCategory) {
      const categoryItems = (cartItems || []).filter(item => item.category && item.category.toLowerCase() === coupon.targetCategory.toLowerCase());
      eligibleSubtotal = categoryItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
      if (eligibleSubtotal <= 0) {
        return { valid: false, reason: `Coupon applies only to category: ${coupon.targetCategory}` };
      }
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (eligibleSubtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, eligibleSubtotal);
    } else if (coupon.type === 'freeship') {
      discountAmount = coupon.shippingCost || 15;
    }

    return {
      valid: true,
      couponCode: coupon.code,
      type: coupon.type,
      discountAmount
    };
  }

  applyStackedCoupons(coupons = [], cartItems = [], subtotal = 0) {
    if (!coupons || coupons.length === 0) {
      return { finalSubtotal: subtotal, totalDiscount: 0, appliedCoupons: [] };
    }

    let currentSubtotal = subtotal;
    let totalDiscount = 0;
    const appliedCoupons = [];

    const maxAllowedDiscount = (subtotal * this.maxGlobalDiscountPct) / 100;

    for (const coupon of coupons) {
      const evaluation = this.evaluateCoupon(coupon, cartItems, currentSubtotal);
      if (evaluation.valid) {
        // Enforce global cap
        let actualDiscount = evaluation.discountAmount;
        if (totalDiscount + actualDiscount > maxAllowedDiscount) {
          actualDiscount = Math.max(0, maxAllowedDiscount - totalDiscount);
        }

        if (actualDiscount > 0) {
          totalDiscount += actualDiscount;
          currentSubtotal = Math.max(0, currentSubtotal - actualDiscount);
          appliedCoupons.push({ ...evaluation, appliedDiscount: actualDiscount });
        }
      }
    }

    return {
      originalSubtotal: subtotal,
      finalSubtotal: Number(currentSubtotal.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      appliedCoupons
    };
  }
}
