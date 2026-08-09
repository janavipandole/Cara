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

  it('returns the original total when there are no coupons', () => {
    const res = engine.calculateStackedDiscount(500, []);
    expect(res.finalTotal).toBe(500);
    expect(res.discountTotal).toBe(0);
    expect(res.appliedCoupons).toEqual([]);
  });

  it('returns the original total for invalid cart totals', () => {
    expect(engine.calculateStackedDiscount(0, [{ code: 'X', type: 'flat', value: 10 }]).finalTotal).toBe(0);
    expect(engine.calculateStackedDiscount(-100, [{ code: 'X', type: 'flat', value: 10 }]).finalTotal).toBe(-100);
  });

  it('caps the number of stacked coupons at the configured maximum', () => {
    const engine2 = new CouponStackingEngine({ maxStackedCoupons: 1 });
    const res = engine2.calculateStackedDiscount(100, [
      { code: 'A', type: 'flat', value: 10 },
      { code: 'B', type: 'flat', value: 10 }
    ]);
    expect(res.appliedCoupons.length).toBe(1);
    expect(res.discountTotal).toBe(10);
  });

  it('never lets a flat discount exceed the current total', () => {
    const res = engine.calculateStackedDiscount(30, [{ code: 'FLAT', type: 'flat', value: 100 }]);
    expect(res.discountTotal).toBe(30);
    expect(res.finalTotal).toBe(0);
  });

  it('tracks the applied coupon codes and discounts', () => {
    const res = engine.calculateStackedDiscount(200, [
      { code: 'PCT', type: 'percentage', value: 10 },
      { code: 'FLAT', type: 'flat', value: 5 }
    ]);
    expect(res.appliedCoupons).toEqual([
      { code: 'PCT', discount: 20 },
      { code: 'FLAT', discount: 5 }
    ]);
  });
});
