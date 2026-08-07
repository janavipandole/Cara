import { describe, it, expect, beforeEach } from 'vitest';
import { PincodeValidationEngine } from '../../js/pincode-validation-engine.js';

describe('PincodeValidationEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new PincodeValidationEngine();
  });

  it('should validate Indian 6-digit postal codes', () => {
    expect(engine.validatePostalCode('110001', 'IN').valid).toBe(true);
    expect(engine.validatePostalCode('010001', 'IN').valid).toBe(false); // cannot start with 0
    expect(engine.validatePostalCode('1100', 'IN').valid).toBe(false);
  });

  it('should validate US 5-digit postal codes', () => {
    expect(engine.validatePostalCode('90210', 'US').valid).toBe(true);
    expect(engine.validatePostalCode('ABCDE', 'US').valid).toBe(false);
  });

  it('should return estimated delivery timelines for valid postal codes', () => {
    const est = engine.estimateDeliveryDays('110001', 'IN');
    expect(est).not.toBeNull();
    expect(est.minDays).toBeGreaterThanOrEqual(1);
    expect(est.tier).toBeDefined();
  });

  it('should return null delivery estimation for invalid postal codes', () => {
    expect(engine.estimateDeliveryDays('INVALID', 'IN')).toBeNull();
  });

  it('should return delivery zone information object for valid pincode', () => {
    const zone = engine.getDeliveryZone('110001', 'IN');
    expect(zone).toEqual({
      zone: 'Express Zone',
      estimatedDaysText: '1-3 business days'
    });
  });

  it('should not apply the Indian metro heuristic to foreign pincodes', () => {
    // 10001 (US) would be "Express" under the old IN-only heuristic.
    const est = engine.estimateDeliveryDays('10001', 'US');
    expect(est).not.toBeNull();
    expect(est.tier).toBe('Standard Zone');
    expect(est.minDays).toBe(3);
  });

  it('should return the standard zone for non-metro Indian pincodes', () => {
    const est = engine.estimateDeliveryDays('700001', 'IN');
    expect(est.tier).toBe('Standard Zone');
    expect(est.minDays).toBe(3);
  });

  it('should validate UK and Canadian postal codes', () => {
    expect(engine.validatePostalCode('SW1A 1AA', 'UK').valid).toBe(true);
    expect(engine.validatePostalCode('K1A 0B1', 'CA').valid).toBe(true);
    expect(engine.validatePostalCode('BAD', 'UK').valid).toBe(false);
  });
});
