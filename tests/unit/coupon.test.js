/**
 * Unit tests for the checkout coupon validation logic.
 *
 * Verifies coupon calculation math and format checking.
 */
import { describe, it, expect } from 'vitest';

const COUPONS = {
  CARA20: 20,
  WELCOME10: 10,
};

function checkCouponCode(rawCode) {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }
  if (COUPONS.hasOwnProperty(code)) {
    return { valid: true, discountPct: COUPONS[code], code };
  }
  return { valid: false, message: 'Invalid coupon code. Try CARA20 or WELCOME10.' };
}

describe('Coupon Validation Logic', () => {
  it('rejects empty coupon codes', () => {
    const res = checkCouponCode('');
    expect(res.valid).toBe(false);
    expect(res.message).toBe('Please enter a coupon code.');
  });

  it('rejects spaces-only coupon codes', () => {
    const res = checkCouponCode('    ');
    expect(res.valid).toBe(false);
    expect(res.message).toBe('Please enter a coupon code.');
  });

  it('accepts CARA20 with 20% discount', () => {
    const res = checkCouponCode('CARA20');
    expect(res.valid).toBe(true);
    expect(res.discountPct).toBe(20);
    expect(res.code).toBe('CARA20');
  });

  it('accepts WELCOME10 with 10% discount', () => {
    const res = checkCouponCode('WELCOME10');
    expect(res.valid).toBe(true);
    expect(res.discountPct).toBe(10);
    expect(res.code).toBe('WELCOME10');
  });

  it('is case-insensitive', () => {
    const res = checkCouponCode('cara20');
    expect(res.valid).toBe(true);
    expect(res.discountPct).toBe(20);
  });

  it('trims leading/trailing whitespace', () => {
    const res = checkCouponCode('  WELCOME10  ');
    expect(res.valid).toBe(true);
    expect(res.code).toBe('WELCOME10');
  });

  it('rejects invalid/unknown coupons', () => {
    const res = checkCouponCode('PROMO50');
    expect(res.valid).toBe(false);
    expect(res.message).toContain('Invalid coupon code');
  });
});
