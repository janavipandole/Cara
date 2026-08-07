/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('js/config.js', () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.CARA_API_BASE_URL;
    delete window.CARA_CONFIG;
    delete window.CARA_COUPONS;
  });

  it('defines API base URL, checkout config, and coupon codes', async () => {
    await import('../../js/config.js');

    expect(window.CARA_API_BASE_URL).toBe('');
    expect(window.CARA_CONFIG.TAX_RATE).toBe(0.18);
    expect(window.CARA_CONFIG.SHIPPING.FREE_THRESHOLD).toBe(3000);
    expect(window.CARA_COUPONS.CARA20).toBe(20);
    expect(window.CARA_COUPONS.WELCOME10).toBe(10);
  });

  it('does not overwrite a pre-set API base URL', async () => {
    window.CARA_API_BASE_URL = 'http://localhost:8000';
    await import('../../js/config.js');
    expect(window.CARA_API_BASE_URL).toBe('http://localhost:8000');
  });

  it('does not overwrite pre-set config values or coupon codes', async () => {
    window.CARA_CONFIG = { TAX_RATE: 0.10, SHIPPING: { FEE: 99, FREE_THRESHOLD: 999 } };
    window.CARA_COUPONS = { CUSTOM10: 10 };
    await import('../../js/config.js');
    expect(window.CARA_CONFIG.TAX_RATE).toBe(0.10);
    expect(window.CARA_CONFIG.SHIPPING.FREE_THRESHOLD).toBe(999);
    expect(window.CARA_COUPONS.CUSTOM10).toBe(10);
    expect(window.CARA_COUPONS.CARA20).toBeUndefined();
  });
});

describe('js/coupon-config.js', () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.CARA_COUPONS;
  });

  it('exposes known coupon codes for the cart page', async () => {
    await import('../../js/coupon-config.js');
    expect(window.CARA_COUPONS.CARA20).toBe(20);
  });
});
