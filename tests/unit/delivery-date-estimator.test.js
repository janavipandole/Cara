import { describe, it, expect } from 'vitest';
import { DeliveryDateEstimator } from '../../js/delivery-date-estimator.js';

describe('DeliveryDateEstimator', () => {
  const estimator = new DeliveryDateEstimator();

  it('skips weekends for standard shipping', () => {
    // Friday
    const friday = new Date('2026-08-07T10:00:00Z');
    const estimated = estimator.estimateDeliveryDate(friday, false);
    // 5 business days from Friday Aug 7 -> Friday Aug 14
    expect(estimated).toBe('2026-08-14');
  });
});
