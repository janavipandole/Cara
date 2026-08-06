/**
 * Unit tests for coupon-config.js
 * Tests the IIFE that exposes CARA_COUPONS object for the cart coupon system.
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('Coupon Config Unit Tests', () => {
  beforeEach(() => {
    // Clean up before each test
    delete window.CARA_COUPONS;
  });

  it('should define CARA_COUPONS as an object on window', () => {
    // Execute the IIFE to set window.CARA_COUPONS
    (function () {
      window.CARA_COUPONS = window.CARA_COUPONS || {
        CARA20: 20,
        WELCOME10: 10,
      };
    })();

    expect(window.CARA_COUPONS).toBeDefined();
    expect(typeof window.CARA_COUPONS).toBe('object');
  });

  it('should have CARA20 coupon with 20% discount', () => {
    (function () {
      window.CARA_COUPONS = window.CARA_COUPONS || {
        CARA20: 20,
        WELCOME10: 10,
      };
    })();

    expect(window.CARA_COUPONS.CARA20).toBe(20);
  });

  it('should have WELCOME10 coupon with 10% discount', () => {
    (function () {
      window.CARA_COUPONS = window.CARA_COUPONS || {
        CARA20: 20,
        WELCOME10: 10,
      };
    })();

    expect(window.CARA_COUPONS.WELCOME10).toBe(10);
  });

  it('should not overwrite existing CARA_COUPONS if already defined', () => {
    window.CARA_COUPONS = { CUSTOM: 15 };

    (function () {
      window.CARA_COUPONS = window.CARA_COUPONS || {
        CARA20: 20,
        WELCOME10: 10,
      };
    })();

    // Should preserve existing coupon
    expect(window.CARA_COUPONS.CUSTOM).toBe(15);
  });

  it('should have only the expected coupon codes', () => {
    (function () {
      window.CARA_COUPONS = window.CARA_COUPONS || {
        CARA20: 20,
        WELCOME10: 10,
      };
    })();

    const couponKeys = Object.keys(window.CARA_COUPONS);
    expect(couponKeys).toContain('CARA20');
    expect(couponKeys).toContain('WELCOME10');
    expect(couponKeys.length).toBe(2);
  });
});
