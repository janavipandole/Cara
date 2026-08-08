import { describe, it, expect } from 'vitest';
import { DeliveryDateEstimator } from '../../js/delivery-date-estimator.js';

describe('DeliveryDateEstimator', () => {
  it('correctly identifies pincode regional tiers', () => {
    const estimator = new DeliveryDateEstimator();
    expect(estimator.getPincodeTier('110001')).toBe('METRO');
    expect(estimator.getPincodeTier('250001')).toBe('TIER_2');
    expect(estimator.getPincodeTier('500001')).toBe('TIER_3');
    expect(estimator.getPincodeTier('850001')).toBe('REMOTE');
  });

  it('shifts order by 1 day if past cutoff hour', () => {
    const estimator = new DeliveryDateEstimator({ cutoffHour: 14 });
    const beforeCutoff = new Date('2026-08-10T10:00:00'); // Monday 10 AM
    const afterCutoff = new Date('2026-08-10T15:00:00');  // Monday 3 PM

    const deliveryBefore = estimator.calculateEstimatedDelivery(beforeCutoff, '110001');
    const deliveryAfter = estimator.calculateEstimatedDelivery(afterCutoff, '110001');

    expect(deliveryAfter.getTime()).toBeGreaterThan(deliveryBefore.getTime());
  });

  it('skips weekend days and blackout dates during transit', () => {
    const estimator = new DeliveryDateEstimator({
      cutoffHour: 14,
      blackoutDates: ['2026-08-12'] // Blackout Wednesday
    });

    const orderDate = new Date('2026-08-10T10:00:00'); // Monday
    const delivery = estimator.calculateEstimatedDelivery(orderDate, '110001'); // 2 working days
    // Tuesday (Day 1), Wednesday (Blackout), Thursday (Day 2) -> Expect Thursday Aug 13
    expect(delivery.getDate()).toBe(13);
  });

  it('returns formatted delivery window object', () => {
    const estimator = new DeliveryDateEstimator();
    const result = estimator.getDeliveryWindowFormatted(new Date('2026-08-10T10:00:00'), '110001');
    expect(result.tier).toBe('METRO');
    expect(typeof result.formatted).toBe('string');
    expect(result.formatted).toContain('-');
  });
});
