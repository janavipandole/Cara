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

  it('should report the minimum spend in the store currency (rupees)', () => {
    const res = calc.validateCoupon('CARA20', 25);
    expect(res.message).toContain('₹50.00');
    expect(res.message).not.toContain('$');
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

  it('should cap discount to maxCap threshold', () => {
    const calc = new PromoDiscountCalculator();
    expect(calc.applyPromoDiscountMaxCap(50, 20)).toBe(20);
    expect(calc.applyPromoDiscountMaxCap(10, 20)).toBe(10);
  });

  it('should return 0 for NaN discount inputs', () => {
    const calc = new PromoDiscountCalculator();
    expect(calc.applyPromoDiscountMaxCap(NaN, 20)).toBe(0);
    expect(calc.applyPromoDiscountMaxCap(NaN, Infinity)).toBe(0);
  });

  it('should treat negative maxCap as Infinity (no cap)', () => {
    const calc = new PromoDiscountCalculator();
    expect(calc.applyPromoDiscountMaxCap(999, -5)).toBe(999);
  });

  it('should waive shipping when a freeship coupon is applied', () => {
    const summary = calc.calculateTotal(40, 'FREESHIP', 10);
    expect(summary.shipping).toBe(0);
    expect(summary.grandTotal).toBe(40);
  });

  it('should reject a coupon below its minimum spend', () => {
    // FLAT15 requires min spend 40; subtotal 30 should be rejected.
    const summary = calc.calculateTotal(30, 'FLAT15', 10);
    expect(summary.appliedCoupon).toBeNull();
    expect(summary.discount).toBe(0);
    expect(summary.grandTotal).toBe(40); // 30 + base shipping 10
  });

  it('should apply the full flat discount when above the minimum spend', () => {
    const summary = calc.calculateTotal(45, 'FLAT15', 10);
    expect(summary.discount).toBe(15);
    expect(summary.appliedCoupon).toBe('FLAT15');
    expect(summary.grandTotal).toBe(40); // 45 - 15 + 10 shipping
  });
});