import { describe, it, expect } from 'vitest';
import { CouponStackingEngine } from '../../js/coupon-stacking-engine.js';

describe('CouponStackingEngine', () => {
  it('applies percentage and fixed coupons with minimum subtotal requirements', () => {
    const engine = new CouponStackingEngine();
    const coupons = [
      { code: 'SAVE10', type: 'percentage', value: 10, minSubtotal: 50 },
      { code: 'FLAT15', type: 'fixed', value: 15, minSubtotal: 80 }
    ];

    const result = engine.applyStackedCoupons(coupons, [], 100);
    expect(result.appliedCoupons).toHaveLength(2);
    expect(result.totalDiscount).toBe(25); // 10% of 100 ($10) + $15 = $25
  });

  it('rejects coupons that do not meet minimum subtotal', () => {
    const engine = new CouponStackingEngine();
    const coupons = [{ code: 'BIGDEAL', type: 'fixed', value: 50, minSubtotal: 200 }];
    const result = engine.applyStackedCoupons(coupons, [], 100);
    expect(result.appliedCoupons).toHaveLength(0);
    expect(result.totalDiscount).toBe(0);
  });

  it('enforces category-specific eligibility', () => {
    const engine = new CouponStackingEngine();
    const cart = [
      { name: 'Shirt', category: 'apparel', price: 40, quantity: 1 },
      { name: 'Shoes', category: 'footwear', price: 60, quantity: 1 }
    ];
    const coupons = [{ code: 'APPAREL20', type: 'percentage', value: 20, targetCategory: 'apparel' }];
    
    const result = engine.applyStackedCoupons(coupons, cart, 100);
    expect(result.appliedCoupons).toHaveLength(1);
    expect(result.totalDiscount).toBe(8); // 20% of 40 ($8)
  });

  it('caps total discounts at maxGlobalDiscountPct limit', () => {
    const engine = new CouponStackingEngine({ maxGlobalDiscountPct: 40 });
    const coupons = [
      { code: 'HALF1', type: 'percentage', value: 30 },
      { code: 'HALF2', type: 'percentage', value: 30 }
    ];
    
    const result = engine.applyStackedCoupons(coupons, [], 100);
    expect(result.totalDiscount).toBe(40); // Capped at 40%
  });
});
