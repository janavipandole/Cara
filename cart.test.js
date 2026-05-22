/**
 * @jest-environment jsdom
 */

const { calculateCartTotals, parsePriceString } = require('./app.js');

describe('parsePriceString', () => {
  test('should parse correctly formatted prices', () => {
    expect(parsePriceString('$20.00')).toBe(20);
    expect(parsePriceString('₹3,000.50')).toBe(3000.5);
    expect(parsePriceString('500')).toBe(500);
    expect(parsePriceString(null)).toBe(0);
    expect(parsePriceString(undefined)).toBe(0);
  });
});

describe('calculateCartTotals', () => {
  test('should calculate correctly for an empty cart', () => {
    const cart = [];
    const result = calculateCartTotals(cart, null);
    expect(result.subtotal).toBe(0);
    expect(result.shipping).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.discount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  test('should calculate totals for multiple quantities', () => {
    const cart = [
      { price: '100', quantity: 2 },
      { price: '500', quantity: 1 },
    ];
    const result = calculateCartTotals(cart, null);
    expect(result.subtotal).toBe(700); // 100*2 + 500*1 = 700
    expect(result.shipping).toBe(150); // Shipping is 150 for < 3000
    expect(result.tax).toBe(126); // 18% of 700 = 126
    expect(result.discount).toBe(0);
    expect(result.grandTotal).toBe(700 + 150 + 126); // 976
  });

  test('should give free shipping above 3000', () => {
    const cart = [{ price: '1500', quantity: 2 }];
    const result = calculateCartTotals(cart, null);
    expect(result.subtotal).toBe(3000);
    expect(result.shipping).toBe(0); // Free shipping
    expect(result.tax).toBe(540); // 18% of 3000
    expect(result.discount).toBe(0);
    expect(result.grandTotal).toBe(3540);
  });

  test('should apply 20% percentage discount for CARA20', () => {
    const cart = [{ price: '1000', quantity: 1 }];
    const result = calculateCartTotals(cart, 'CARA20');
    expect(result.subtotal).toBe(1000);
    expect(result.shipping).toBe(150);
    expect(result.tax).toBe(180);
    expect(result.discount).toBe(200); // 20% of 1000
    expect(result.grandTotal).toBe(1000 + 150 + 180 - 200); // 1130
  });

  test('should apply 10% percentage discount for WELCOME10', () => {
    const cart = [{ price: '1000', quantity: 1 }];
    const result = calculateCartTotals(cart, 'WELCOME10');
    expect(result.discount).toBe(100); // 10% of 1000
    expect(result.grandTotal).toBe(1000 + 150 + 180 - 100); // 1230
  });

  test('should apply fixed amount discount for FLAT50', () => {
    const cart = [{ price: '1000', quantity: 1 }];
    const result = calculateCartTotals(cart, 'FLAT50');
    expect(result.discount).toBe(50); // 50 off
    expect(result.grandTotal).toBe(1000 + 150 + 180 - 50); // 1280
  });
});
