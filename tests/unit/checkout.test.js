import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { calculateOrderTotals } = require('../../checkout.js');

describe('Checkout Calculations', () => {
  it('calculates correct subtotal and 18% GST for basic items', () => {
    const cart = [
      { name: 'Tropical Print Shirt', price: '₹1,000', quantity: 2 },
      { name: 'Casual Trousers', price: '₹500', quantity: 1 },
    ];
    // subtotal = 1000 * 2 + 500 * 1 = 2500
    // GST (18%) = 2500 * 0.18 = 450
    // shipping = 150 (since 2500 < 3000)
    // total = 2500 + 450 + 150 = 3100
    const totals = calculateOrderTotals(cart);
    expect(totals.subtotal).toBe(2500);
    expect(totals.tax).toBe(450);
    expect(totals.shipping).toBe(150);
    expect(totals.grandTotal).toBe(3100);
  });

  it('applies free shipping for orders >= ₹3000', () => {
    const cart = [{ name: 'Fancy Jacket', price: '₹3,000', quantity: 1 }];
    // subtotal = 3000
    // GST (18%) = 3000 * 0.18 = 540
    // shipping = 0 (since subtotal >= 3000)
    // total = 3000 + 540 = 3540
    const totals = calculateOrderTotals(cart);
    expect(totals.subtotal).toBe(3000);
    expect(totals.tax).toBe(540);
    expect(totals.shipping).toBe(0);
    expect(totals.grandTotal).toBe(3540);
  });

  it('handles empty cart correctly', () => {
    const totals = calculateOrderTotals([]);
    expect(totals.subtotal).toBe(0);
    expect(totals.tax).toBe(0);
    expect(totals.shipping).toBe(0);
    expect(totals.grandTotal).toBe(0);
  });

  it('applies coupons, urgency discount, gift wrapping and loyalty points', () => {
    const cart = [{ name: 'Dresses', price: '₹2,000', quantity: 2 }];
    // subtotal = 4000
    // GST (18%) = 720
    // shipping = 0 (subtotal >= 3000)
    // CARA20 coupon = 20% discount = 800
    // Urgency discount = 5% = 200
    // Gift wrap = 99
    // Loyalty points: 150 points = 15 discount
    // Total = 4000 + 720 + 0 + 99 - 800 - 200 - 15 = 3804
    const totals = calculateOrderTotals(
      cart,
      'CARA20', // coupon code
      true, // urgency timer discount active
      true, // gift wrap opt-in
      150, // loyalty points applied
    );
    expect(totals.subtotal).toBe(4000);
    expect(totals.tax).toBe(720);
    expect(totals.shipping).toBe(0);
    expect(totals.couponDiscount).toBe(800);
    expect(totals.urgencyDiscount).toBe(200);
    expect(totals.giftCharge).toBe(99);
    expect(totals.loyaltyDiscount).toBe(15);
    expect(totals.grandTotal).toBe(3804);
  });

  it('ensures grand total is never negative', () => {
    const cart = [{ name: 'Cheap Item', price: '₹10', quantity: 1 }];
    // subtotal = 10, GST = 1.8, shipping = 150
    // coupon CARA20 = 2, urgency = 0.5
    // loyalty points = 1000 points = 100 discount
    // We apply high loyalty discount to exceed the positive charges (10 + 1.8 + 150 = 161.8)
    const totals = calculateOrderTotals(
      cart,
      'CARA20',
      true,
      false,
      2000, // 2000 points = 200 discount
    );
    expect(totals.grandTotal).toBe(0);
  });
});
