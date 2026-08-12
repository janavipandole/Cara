/**
 * Promo Discount Calculator Engine
 * Handles coupon validation, percentage/flat discounts, minimum subtotal thresholds, and free shipping calculation.
 */

class PromoDiscountCalculator {
  constructor(options = {}) {
    this.coupons = {
      'WELCOME10': { type: 'percent', value: 10, minSpend: 20 },
      'CARA20': { type: 'percent', value: 20, minSpend: 50 },
      'FLAT15': { type: 'flat', value: 15, minSpend: 40 },
      'FREESHIP': { type: 'freeship', value: 0, minSpend: 30 }
    };
    this.freeShippingThreshold = 75;
    this.maxDiscountCap = options.maxDiscountCap !== undefined ? options.maxDiscountCap : Infinity;
  }

  validateCoupon(code, subtotal = 0) {
    if (!code || typeof code !== 'string') {
      return { valid: false, message: 'Please enter a coupon code.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = this.coupons[cleanCode];

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code.' };
    }

    if (subtotal < coupon.minSpend) {
      return {
        valid: false,
        message: `Coupon '${cleanCode}' requires a minimum spend of $${coupon.minSpend.toFixed(2)}.`
      };
    }

    return { valid: true, coupon, code: cleanCode };
  }

  calculateTotal(subtotal, couponCode = '', baseShipping = 10) {
    let discount = 0;
    let shipping = subtotal >= this.freeShippingThreshold ? 0 : baseShipping;
    let appliedCoupon = null;

    if (couponCode) {
      const validation = this.validateCoupon(couponCode, subtotal);
      if (validation.valid) {
        appliedCoupon = validation.coupon;
        if (appliedCoupon.type === 'percent') {
          discount = (subtotal * appliedCoupon.value) / 100;
          discount = this.applyPromoDiscountMaxCap(discount, this.maxDiscountCap);
        } else if (appliedCoupon.type === 'flat') {
          discount = Math.min(subtotal, appliedCoupon.value);
        } else if (appliedCoupon.type === 'freeship') {
          shipping = 0;
        }
      }
    }

    const finalTotal = Math.max(0, subtotal - discount + shipping);

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      grandTotal: parseFloat(finalTotal.toFixed(2)),
      appliedCoupon: appliedCoupon ? couponCode.trim().toUpperCase() : null
    };
  }

  /**
   * Caps a calculated percentage discount to a maximum absolute amount.
   * @param {number} discount - The raw discount amount (already computed).
   * @param {number} maxCap   - The maximum allowed discount in currency units.
   * @returns {number} The capped discount, never exceeding maxCap.
   */
  applyPromoDiscountMaxCap(discount, maxCap = Infinity) {
    if (typeof discount !== 'number' || Number.isNaN(discount)) return 0;
    if (typeof maxCap !== 'number' || Number.isNaN(maxCap) || maxCap < 0) {
      maxCap = Infinity;
    }
    return Math.min(Math.max(0, discount), maxCap);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromoDiscountCalculator;
} else {
  window.PromoDiscountCalculator = PromoDiscountCalculator;
}
