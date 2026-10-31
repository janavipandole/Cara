import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('coupon-config.js — window.CARA_COUPONS initialization', () => {
  beforeEach(() => {
    delete window.CARA_COUPONS;
    vi.resetModules();
  });

  afterEach(() => {
    // Global teardown
  });

  it('initializes window.CARA_COUPONS with CARA20 and WELCOME10', async () => {
    await import('../../js/coupon-config.js');
    expect(window.CARA_COUPONS).toBeDefined();
    expect(window.CARA_COUPONS.CARA20).toBe(20);
    expect(window.CARA_COUPONS.WELCOME10).toBe(10);
  });

  it('does not overwrite an existing CARA_COUPONS object', async () => {
    window.CARA_COUPONS = { CUSTOM50: 50 };
    await import('../../js/coupon-config.js');
    expect(window.CARA_COUPONS.CUSTOM50).toBe(50);
  });

  it('keeps custom codes when CARA_COUPONS already has values', async () => {
    window.CARA_COUPONS = { SAVE5: 5 };
    await import('../../js/coupon-config.js');
    expect(window.CARA_COUPONS.SAVE5).toBe(5);
    expect(window.CARA_COUPONS.CARA20).toBeUndefined();
  });

  it('provides numeric discount percentages for the default codes', async () => {
    await import('../../js/coupon-config.js');
    expect(typeof window.CARA_COUPONS.CARA20).toBe('number');
    expect(typeof window.CARA_COUPONS.WELCOME10).toBe('number');
    expect(window.CARA_COUPONS.WELCOME10).toBe(10);
  });
});
