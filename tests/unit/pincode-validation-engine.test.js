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
      estimatedDaysText: '1-3 business days',
    });
  });
});
