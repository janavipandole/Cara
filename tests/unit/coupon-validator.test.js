import { beforeEach, describe, expect, it, vi } from 'vitest';

function setupDom() {
  document.body.innerHTML = `
    <input id="couponCodeInput" value="">
    <button id="applyCouponBtn">Apply</button>
    <div id="couponFeedback"></div>
  `;
}

beforeEach(() => {
  vi.resetModules();
  setupDom();
  localStorage.clear();
  window.CARA_COUPONS = { CARA20: 20, WELCOME10: 10 };
  delete window.appliedCoupon;
  delete window.removeCoupon;
});

async function load() {
  await import('../../js/coupon-validator.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

const apply = () => document.getElementById('applyCouponBtn').click();
const feedback = () => document.getElementById('couponFeedback').textContent;

describe('coupon-validator', () => {
  it('shows error feedback for an empty code', async () => {
    await load();
    apply();
    expect(feedback()).toContain('Please enter a coupon code.');
  });

  it('applies a known coupon, trims/uppercases it, and persists it', async () => {
    document.getElementById('couponCodeInput').value = 'cara20';
    await load();
    apply();
    expect(feedback()).toContain('Coupon "CARA20" applied');
    expect(window.appliedCoupon).toBe('CARA20');
    expect(localStorage.getItem('appliedCoupon')).toBe('CARA20');
  });

  it('rejects an unknown coupon code', async () => {
    document.getElementById('couponCodeInput').value = 'BOGUS';
    await load();
    apply();
    expect(feedback()).toContain('Invalid coupon code');
  });

  it('dispatches couponApplied event', async () => {
    document.getElementById('couponCodeInput').value = 'WELCOME10';
    const listener = vi.fn();
    window.addEventListener('couponApplied', listener);
    await load();
    apply();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('removes the coupon via the exposed helper', async () => {
    window.appliedCoupon = 'CARA20';
    await load();
    window.removeCoupon();
    expect(window.appliedCoupon).toBe('');
    expect(localStorage.getItem('appliedCoupon')).toBeNull();
  });

  it('should check if coupon expiry date is in the past', async () => {
    await load();
    expect(window.isCouponDateExpired('2020-01-01')).toBe(true);
    expect(window.isCouponDateExpired('2099-01-01')).toBe(false);
  });

  it('should treat missing expiry dates as not expired', async () => {
    await load();
    expect(window.isCouponDateExpired(null)).toBe(false);
    expect(window.isCouponDateExpired('')).toBe(false);
  });

  it('should treat invalid expiry date strings as not expired', async () => {
    await load();
    expect(window.isCouponDateExpired('not-a-date')).toBe(false);
  });
});
