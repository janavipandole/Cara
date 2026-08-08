import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('coupon-config.js — window.CARA_COUPONS initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.CARA_COUPONS;
  });

  afterEach(() => {
    vi.resetModules();
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
    // IIFE uses window.CARA_COUPONS = window.CARA_COUPONS || { ... }
    // so existing keys should be preserved
    expect(window.CARA_COUPONS.CUSTOM50).toBe(50);
  });
});
