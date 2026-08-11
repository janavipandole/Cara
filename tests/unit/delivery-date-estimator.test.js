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

  it('skips weekends for express shipping', () => {
    // Friday Aug 7 + 2 business days -> Tuesday Aug 11
    const friday = new Date('2026-08-07T10:00:00Z');
    const estimated = estimator.estimateDeliveryDate(friday, true);
    expect(estimated).toBe('2026-08-11');
  });

  it('never returns a weekend delivery date', () => {
    // Start on a Wednesday; 5 business days later must be a weekday.
    const wednesday = new Date('2026-08-05T10:00:00Z');
    const estimated = estimator.estimateDeliveryDate(wednesday, false);
    const day = new Date(estimated + 'T00:00:00Z').getDay();
    expect(day).not.toBe(0);
    expect(day).not.toBe(6);
  });

  it('returns an ISO date string in yyyy-mm-dd format', () => {
    const start = new Date('2026-08-10T10:00:00Z');
    const estimated = estimator.estimateDeliveryDate(start, false);
    expect(estimated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns null for an invalid date input', () => {
    expect(estimator.estimateDeliveryDate('not-a-date')).toBeNull();
    expect(estimator.estimateDeliveryDate(NaN)).toBeNull();
  });

  it('returns null for a date object that cannot parse', () => {
    expect(estimator.estimateDeliveryDate(new Date('bogus'))).toBeNull();
  });
});
