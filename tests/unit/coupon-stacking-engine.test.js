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
    expect(res.discountTotal).toBe(140);
    expect(res.finalTotal).toBe(860);
  });
});
