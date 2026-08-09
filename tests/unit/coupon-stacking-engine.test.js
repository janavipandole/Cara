import { describe, it, expect } from 'vitest';
import { CouponStackingEngine } from '../../js/coupon-stacking-engine.js';

describe('CouponStackingEngine', () => {
  const engine = new CouponStackingEngine();

  it('stacks percentage and flat coupons up to max limit', () => {
    const coupons = [
      { code: 'SAVE10', type: 'percentage', value: 10 },
      { code: 'FLAT50', type: 'flat', value: 50 }
    ];
    const res = engine.calculateStackedDiscount(1000, coupons);
    // 10% of 1000 = 100, then flat 50 applied to the reduced total.
    expect(res.discountTotal).toBe(150);
    expect(res.finalTotal).toBe(850);
  });
});
