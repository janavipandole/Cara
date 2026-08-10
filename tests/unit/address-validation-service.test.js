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
      country: 'US'
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
      country: 'US'
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.street).toBe('123 Main St alert(1)');
  });

  it('should validate UK and Canadian postal code formats', () => {
    expect(service.validatePostalCode('SW1A 1AA', 'UK').valid).toBe(true);
    expect(service.validatePostalCode('K1A 0B1', 'CA').valid).toBe(true);
    expect(service.validatePostalCode('not-a-postcode', 'UK').valid).toBe(false);
  });

  it('should report missing address fields as invalid', () => {
    const result = service.validateAddress({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.street).toBeDefined();
    expect(result.errors.city).toBeDefined();
    expect(result.errors.state).toBeDefined();
    expect(result.errors.postalCode).toBeDefined();
    expect(result.sanitized).toBeNull();
  });

  it('should uppercase the sanitized state and country fields', () => {
    const result = service.validateAddress({
      street: '10 Downing St',
      city: 'London',
      state: 'england',
      postalCode: 'SW1A 2AA',
      country: 'uk'
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.state).toBe('ENGLAND');
    expect(result.sanitized.country).toBe('UK');
  });

  it('should accept addresses with leading and trailing whitespace', () => {
    const result = service.validateAddress({
      street: '  123 Main Street  ',
      city: '  Denver  ',
      state: ' CO ',
      postalCode: ' 80202 ',
      country: 'US'
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.street).toBe('123 Main Street');
    expect(result.sanitized.city).toBe('Denver');
    expect(result.sanitized.state).toBe('CO');
    expect(result.sanitized.postalCode).toBe('80202');
  });

  it('should trim the postal code before validating', () => {
    expect(service.validatePostalCode('  90210  ', 'US').valid).toBe(true);
    expect(service.validatePostalCode(' 400001 ', 'IN').valid).toBe(true);
  });

  it('should still reject a short street after trimming whitespace', () => {
    const result = service.validateAddress({
      street: '  123  ',
      city: 'Austin',
      state: 'TX',
      postalCode: '73301',
      country: 'US'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.street).toBeDefined();
  });
});
