import { describe, it, expect } from 'vitest';
import { PincodeValidationEngine } from '../../js/pincode-validation-engine.js';

describe('pincode-validation-engine', () => {
  let engine;

  beforeEach(() => {
    engine = new PincodeValidationEngine();
  });

  describe('validatePostalCode', () => {
    describe('US', () => {
      it('accepts valid 5-digit US zip', () => {
        const result = engine.validatePostalCode('12345', 'US');
        expect(result.valid).toBe(true);
      });

      it('accepts valid US zip with extension', () => {
        const result = engine.validatePostalCode('12345-6789', 'US');
        expect(result.valid).toBe(true);
      });

      it('rejects invalid US zip (too short)', () => {
        const result = engine.validatePostalCode('1234', 'US');
        expect(result.valid).toBe(false);
      });
    });

    describe('IN', () => {
      it('accepts valid 6-digit Indian PIN', () => {
        const result = engine.validatePostalCode('110001', 'IN');
        expect(result.valid).toBe(true);
      });

      it('rejects PIN starting with 0', () => {
        const result = engine.validatePostalCode('012345', 'IN');
        expect(result.valid).toBe(false);
      });
    });

    describe('UK', () => {
      it('accepts valid UK postcode', () => {
        const result = engine.validatePostalCode('SW1A 1AA', 'UK');
        expect(result.valid).toBe(true);
      });
    });

    describe('CA', () => {
      it('accepts valid Canadian postal code', () => {
        const result = engine.validatePostalCode('K1A 0B1', 'CA');
        expect(result.valid).toBe(true);
      });
    });

    describe('generic fallback', () => {
      it('accepts valid generic alphanumeric code', () => {
        const result = engine.validatePostalCode('ABC123', 'XX');
        expect(result.valid).toBe(true);
      });

      it('rejects generic code with no digits', () => {
        const result = engine.validatePostalCode('ABCDEF', 'XX');
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('estimateDeliveryDays', () => {
    it('returns Express Zone for Indian PIN 11xxxx', () => {
      const result = engine.estimateDeliveryDays('110001', 'IN');
      expect(result.minDays).toBe(1);
      expect(result.maxDays).toBe(3);
      expect(result.tier).toBe('Express Zone');
    });

    it('returns Standard Zone for Indian PIN 80xxxx', () => {
      const result = engine.estimateDeliveryDays('800001', 'IN');
      expect(result.minDays).toBe(3);
      expect(result.maxDays).toBe(5);
      expect(result.tier).toBe('Standard Zone');
    });

    it('returns default for non-Indian PIN', () => {
      const result = engine.estimateDeliveryDays('12345', 'US');
      expect(result.minDays).toBe(3);
      expect(result.maxDays).toBe(7);
      expect(result.tier).toBe('Standard Zone');
    });

    it('returns null for invalid PIN', () => {
      const result = engine.estimateDeliveryDays('invalid', 'IN');
      expect(result).toBeNull();
    });
  });

  describe('getDeliveryZone', () => {
    it('returns zone and estimatedDaysText for valid PIN', () => {
      const result = engine.getDeliveryZone('110001', 'IN');
      expect(result.zone).toBe('Express Zone');
      expect(result.estimatedDaysText).toBe('1-3 business days');
    });

    it('returns null for invalid PIN', () => {
      const result = engine.getDeliveryZone('bad', 'IN');
      expect(result).toBeNull();
    });
  });

  describe('getSupportedCountries', () => {
    it('returns array of country codes', () => {
      const countries = engine.getSupportedCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries).toContain('US');
      expect(countries).toContain('IN');
      expect(countries).toContain('UK');
      expect(countries).toContain('CA');
    });
  });
});
