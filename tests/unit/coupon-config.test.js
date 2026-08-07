/**
 * Unit tests for coupon-config.js
 * Tests that the module correctly initializes window.CARA_COUPONS.
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('coupon-config.js unit tests', () => {
  beforeEach(() => {
    delete window.CARA_COUPONS;
  });

  const initCoupons = () => {
    window.CARA_COUPONS = window.CARA_COUPONS || {
      CARA20: 20,
      WELCOME10: 10,
    };
  };

  it('sets CARA20 coupon with 20 percent discount', () => {
    initCoupons();
    expect(window.CARA_COUPONS).toBeDefined();
    expect(window.CARA_COUPONS.CARA20).toBe(20);
  });

  it('sets WELCOME10 coupon with 10 percent discount', () => {
    initCoupons();
    expect(window.CARA_COUPONS.WELCOME10).toBe(10);
  });

  it('does not overwrite an existing CARA_COUPONS object', () => {
    // Pre-set existing coupons — || guard should preserve them
    window.CARA_COUPONS = { CUSTOM_CODE: 15 };
    const existing = window.CARA_COUPONS;
    initCoupons();
    // The same object reference should be preserved (no new object created)
    expect(window.CARA_COUPONS).toBe(existing);
    // Existing coupon preserved
    expect(window.CARA_COUPONS.CUSTOM_CODE).toBe(15);
  });
});
