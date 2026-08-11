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

  it('ignores coupons beyond the default max stack of two', () => {
    const coupons = [
      { code: 'A', type: 'percentage', value: 10 },
      { code: 'B', type: 'flat', value: 50 },
      { code: 'C', type: 'flat', value: 100 },
    ];
    const res = engine.calculateStackedDiscount(1000, coupons);
    expect(res.appliedCoupons.length).toBe(2);
    // A (100) + B (50); C is ignored.
    expect(res.discountTotal).toBe(150);
  });

  it('honors a custom max stack count', () => {
    const engine3 = new CouponStackingEngine({ maxStackedCoupons: 3 });
    const coupons = [
      { code: 'A', type: 'percentage', value: 10 },
      { code: 'B', type: 'flat', value: 50 },
      { code: 'C', type: 'flat', value: 100 },
    ];
    const res = engine3.calculateStackedDiscount(1000, coupons);
    expect(res.appliedCoupons.length).toBe(3);
  });

  it('returns zero discount for an empty coupon list', () => {
    const res = engine.calculateStackedDiscount(1000, []);
    expect(res.discountTotal).toBe(0);
    expect(res.finalTotal).toBe(1000);
  });

  it('clamps flat discount to the remaining cart total', () => {
    const res = engine.calculateStackedDiscount(30, [
      { code: 'FLAT99', type: 'flat', value: 99 },
    ]);
    expect(res.discountTotal).toBe(30);
    expect(res.finalTotal).toBe(0);
  });
});
