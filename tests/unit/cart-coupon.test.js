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

  it('reads the cart subtotal from productsInCart for coupon validation', async () => {
    const validateCoupon = vi.fn(() => ({
      valid: true,
      code: 'CARA20',
      discountPct: 20,
    }));
    window.PromoDiscountCalculator = class {
      validateCoupon(...args) {
        return validateCoupon(...args);
      }
    };
    localStorage.setItem(
      'productsInCart',
      JSON.stringify([
        { name: 'T-Shirt', price: '500', quantity: 2 },
        { name: 'Jeans', price: '1000', quantity: 1 },
      ]),
    );
    document.getElementById('coupon-code-input').value = 'CARA20';

    await import('../../js/cart-coupon.js');
    apply();

    expect(validateCoupon).toHaveBeenCalledWith('CARA20', 2000);
  });

  it('validates against a zero subtotal when the cart is empty', async () => {
    const validateCoupon = vi.fn(() => ({
      valid: true,
      code: 'CARA20',
      discountPct: 20,
    }));
    window.PromoDiscountCalculator = class {
      validateCoupon(...args) {
        return validateCoupon(...args);
      }
    };
    // No productsInCart entry at all.
    document.getElementById('coupon-code-input').value = 'CARA20';

    await import('../../js/cart-coupon.js');
    apply();

    expect(validateCoupon).toHaveBeenCalledWith('CARA20', 0);
  });

  it('applies a coupon code with mixed case', async () => {
    const validateCoupon = vi.fn(() => ({
      valid: true,
      code: 'CARA20',
      discountPct: 20,
    }));
    window.PromoDiscountCalculator = class {
      validateCoupon(...args) {
        return validateCoupon(...args);
      }
    };
    document.getElementById('coupon-code-input').value = 'CaRa20';

    await import('../../js/cart-coupon.js');
    apply();

    expect(validateCoupon).toHaveBeenCalledWith('CARA20', 0);
    expect(window.appliedCoupon).toBe('CARA20');
  });
});
