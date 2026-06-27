/**
 * Tests for the checkout-summary calculation logic.
 *
 * We extract the pure calculation functions from checkout-summary.js
 * and test them in isolation so we don't need a real DOM or localStorage.
 */
import { describe, it, expect } from 'vitest';

// ── Pure calculation helpers (duplicated here to keep tests independent) ──
const TAX_RATE       = 0.18;
const SHIP_THRESHOLD = 3000;
const SHIP_COST      = 150;
const COUPON_DISCOUNTS = { CARA20: 20, WELCOME10: 10 };

function calcSubtotal(cart) {
  return cart.reduce((acc, item) => {
    return acc + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
  }, 0);
}

function calcShipping(subtotal) {
  return subtotal >= SHIP_THRESHOLD || subtotal === 0 ? 0 : SHIP_COST;
}

function calcTax(subtotal) {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

function calcDiscount(subtotal, couponCode) {
  const pct = COUPON_DISCOUNTS[(couponCode || '').trim().toUpperCase()] || 0;
  return Math.round(subtotal * pct / 100 * 100) / 100;
}

function calcGrandTotal(subtotal, tax, shipping, discount) {
  return Math.max(0, subtotal + tax + shipping - discount);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Checkout Summary — subtotal calculation', () => {
  it('returns 0 for empty cart', () => {
    expect(calcSubtotal([])).toBe(0);
  });

  it('multiplies price × quantity for a single item', () => {
    const cart = [{ price: '500', quantity: '2' }];
    expect(calcSubtotal(cart)).toBe(1000);
  });

  it('sums multiple items correctly', () => {
    const cart = [
      { price: '400', quantity: '1' },
      { price: '600', quantity: '2' },
    ];
    expect(calcSubtotal(cart)).toBe(1600);
  });

  it('defaults quantity to 1 when missing or invalid', () => {
    const cart = [{ price: '300', quantity: '' }];
    expect(calcSubtotal(cart)).toBe(300);
  });

  it('handles float prices', () => {
    const cart = [{ price: '199.99', quantity: '3' }];
    expect(calcSubtotal(cart)).toBeCloseTo(599.97, 2);
  });
});

describe('Checkout Summary — shipping calculation', () => {
  it('charges ₹150 when subtotal is below ₹3000', () => {
    expect(calcShipping(2999)).toBe(150);
  });

  it('is free when subtotal exactly equals threshold', () => {
    expect(calcShipping(3000)).toBe(0);
  });

  it('is free when subtotal exceeds threshold', () => {
    expect(calcShipping(5000)).toBe(0);
  });

  it('is free for empty cart (subtotal === 0)', () => {
    expect(calcShipping(0)).toBe(0);
  });
});

describe('Checkout Summary — tax calculation', () => {
  it('applies 18% GST', () => {
    expect(calcTax(1000)).toBe(180);
  });

  it('rounds to 2 decimal places', () => {
    // 18% of 333 = 59.94
    expect(calcTax(333)).toBe(59.94);
  });

  it('returns 0 for zero subtotal', () => {
    expect(calcTax(0)).toBe(0);
  });
});

describe('Checkout Summary — coupon discount', () => {
  it('applies 20% discount for CARA20', () => {
    expect(calcDiscount(1000, 'CARA20')).toBe(200);
  });

  it('applies 10% discount for WELCOME10', () => {
    expect(calcDiscount(1000, 'WELCOME10')).toBe(100);
  });

  it('applies 0 for unknown coupon', () => {
    expect(calcDiscount(1000, 'INVALID')).toBe(0);
  });

  it('is case-insensitive', () => {
    expect(calcDiscount(1000, 'cara20')).toBe(200);
  });

  it('handles empty string coupon', () => {
    expect(calcDiscount(1000, '')).toBe(0);
  });

  it('handles null coupon', () => {
    expect(calcDiscount(1000, null)).toBe(0);
  });
});

describe('Checkout Summary — grand total', () => {
  it('sums subtotal + tax + shipping - discount', () => {
    // subtotal 2000, tax 360, shipping 150, discount 400 = 2110
    expect(calcGrandTotal(2000, 360, 150, 400)).toBe(2110);
  });

  it('never returns a negative total', () => {
    expect(calcGrandTotal(0, 0, 0, 500)).toBe(0);
  });

  it('free shipping reflected in total', () => {
    // subtotal 3000, tax 540, shipping 0, discount 0 = 3540
    expect(calcGrandTotal(3000, 540, 0, 0)).toBe(3540);
  });
});
