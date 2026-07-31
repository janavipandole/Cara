/**
 * Dynamic Coupon & Promo Validation Engine
 */
class CouponEngine {
    constructor() {
        this.coupons = {
            'SAVE10': { discountPercent: 10, minSubtotal: 50 },
            'CARA20': { discountPercent: 20, minSubtotal: 100 },
            'ELUSOC2026': { discountPercent: 25, minSubtotal: 0 }
        };
    }

    validate(code, subtotal) {
        const coupon = this.coupons[code.toUpperCase()];
        if (!coupon) return { valid: false, message: 'Invalid promo code' };
        if (subtotal < coupon.minSubtotal) {
            return { valid: false, message: `Minimum subtotal of $${coupon.minSubtotal} required` };
        }
        const discountAmount = (subtotal * coupon.discountPercent) / 100;
        return { valid: true, discountPercent: coupon.discountPercent, discountAmount, message: 'Coupon applied successfully!' };
    }
}
window.couponEngine = new CouponEngine();
