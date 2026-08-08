import { describe, it, expect, beforeEach } from 'vitest';
const AddressValidationService = require('../../js/address-validation-service.js');

describe('AddressValidationService Unit Tests', () => {
  let service;

  beforeEach(() => {
    service = new AddressValidationService();
  });

  it('should validate US 5-digit zip code', () => {
    const res = service.validatePostalCode('90210', 'US');
    expect(res.valid).toBe(true);
  });

  it('should validate Indian 6-digit PIN code', () => {
    const res = service.validatePostalCode('400001', 'IN');
    expect(res.valid).toBe(true);
  });

  it('should reject invalid postal codes', () => {
    const res = service.validatePostalCode('INVALID', 'US');
    expect(res.valid).toBe(false);
  });

  it('should validate full address payload and return sanitized output', () => {
    const result = service.validateAddress({
      street: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    });

    expect(result.isValid).toBe(true);
    expect(result.sanitized.city).toBe('San Francisco');
  });

  it('should sanitize HTML tags from street address field', () => {
    const result = service.validateAddress({
      street: '123 Main St <script>alert(1)</script>',
      city: 'Boston',
      state: 'MA',
      postalCode: '02108',
      country: 'US',
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.street).toBe('123 Main St alert(1)');
  });
});
