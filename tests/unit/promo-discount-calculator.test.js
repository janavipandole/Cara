import { describe, it, expect, beforeEach } from 'vitest';
const PromoDiscountCalculator = require('../../js/promo-discount-calculator.js');

describe('PromoDiscountCalculator Unit Tests', () => {
  let calc;

  beforeEach(() => {
    calc = new PromoDiscountCalculator();
  });

  it('should validate valid coupons meeting min spend', () => {
    const res = calc.validateCoupon('WELCOME10', 30);
    expect(res.valid).toBe(true);
    expect(res.coupon.value).toBe(10);
  });

  it('should reject coupons below min spend threshold', () => {
    const res = calc.validateCoupon('CARA20', 25);
    expect(res.valid).toBe(false);
    expect(res.message).toContain('minimum spend');
  });

  it('should calculate percentage discount correctly', () => {
    const summary = calc.calculateTotal(100, 'WELCOME10', 10);
    expect(summary.subtotal).toBe(100);
    expect(summary.discount).toBe(10);
    expect(summary.shipping).toBe(0); // Free shipping threshold met ($100 >= $75)
    expect(summary.grandTotal).toBe(90);
  });

  it('should calculate flat discount correctly', () => {
    const summary = calc.calculateTotal(50, 'FLAT15', 10);
    expect(summary.subtotal).toBe(50);
    expect(summary.discount).toBe(15);
    expect(summary.shipping).toBe(10);
    expect(summary.grandTotal).toBe(45);
  });
});
