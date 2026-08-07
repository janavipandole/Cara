import { beforeEach, describe, expect, it, vi } from 'vitest';

function setupDom() {
  document.body.innerHTML = `
    <input id="coupon-code-input" value="">
    <button id="apply-coupon-btn">Apply</button>
    <div id="coupon-feedback"></div>
  `;
}

const apply = () => document.getElementById('apply-coupon-btn').click();
const feedback = () => document.getElementById('coupon-feedback').textContent;

beforeEach(() => {
  vi.resetModules();
  setupDom();
  localStorage.clear();
  delete window.PromoDiscountCalculator;
  delete window.appliedCoupon;
});

describe('cart-coupon', () => {
  it('shows error feedback for an empty coupon code', async () => {
    await import('../../js/cart-coupon.js');
    apply();
    expect(feedback()).toContain('Please enter a coupon code.');
  });

  it('applies a valid coupon via PromoDiscountCalculator and trims the code', async () => {
    window.PromoDiscountCalculator = class {
      validateCoupon(code, subtotal) {
        return code === 'CARA20'
          ? { valid: true, code, discountPct: 20 }
          : { valid: false, message: 'Invalid coupon code.' };
      }
    };
    document.getElementById('coupon-code-input').value = '  cara20  ';
    const listener = vi.fn();
    window.addEventListener('couponApplied', listener);

    await import('../../js/cart-coupon.js');
    apply();

    expect(feedback()).toContain('applied successfully');
    expect(window.appliedCoupon).toBe('CARA20');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('rejects an unknown coupon in the fallback path', async () => {
    document.getElementById('coupon-code-input').value = 'NOPE';
    await import('../../js/cart-coupon.js');
    apply();
    expect(feedback()).toContain('Invalid coupon code');
  });

  it('removes the applied coupon and clears storage', async () => {
    window.appliedCoupon = 'CARA20';
    localStorage.setItem('appliedCoupon', 'CARA20');
    await import('../../js/cart-coupon.js');
    window.removeCoupon();
    expect(window.appliedCoupon).toBe('');
    expect(localStorage.getItem('appliedCoupon')).toBeNull();
  });
});
