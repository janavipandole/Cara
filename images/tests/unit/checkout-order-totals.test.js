import { describe, it, expect } from 'vitest';
import { calculateOrderTotals } from '../../checkout.js';

describe('calculateOrderTotals', () => {
  it('calculates subtotal, discount, tax, and total accurately with proper 2 decimal places precision rounding', () => {
    const items = [
      { price: 19.99, quantity: 3 },
      { price: 45.50, quantity: 1 },
    ];
    // Subtotal: 19.99 * 3 + 45.50 = 59.97 + 45.50 = 105.47
    // Discount 20%: 105.47 * 0.20 = 21.094 -> 21.09
    // Taxable: 105.47 - 21.09 = 84.38
    // Tax 18%: 84.38 * 0.18 = 15.1884 -> 15.19
    // Total: 84.38 + 15.19 = 99.57

    const result = calculateOrderTotals(items, 20, 0.18);
    expect(result.subtotal).toBe(105.47);
    expect(result.discount).toBe(21.09);
    expect(result.taxableAmount).toBe(84.38);
    expect(result.tax).toBe(15.19);
    expect(result.total).toBe(99.57);
  });

  it('handles empty items array gracefully', () => {
    const result = calculateOrderTotals([], 0, 0.18);
    expect(result.subtotal).toBe(0);
    expect(result.discount).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });
});
