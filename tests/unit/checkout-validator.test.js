import { describe, it, expect } from 'vitest';
import {
  validateCreditCardLuhn,
  validateExpiryDate,
  validatePostalCode,
  validateEmail,
  validatePhone
} from '../../js/checkout-validator.js';

describe('Checkout Form Validator Unit Tests', () => {
  it('should validate credit card numbers using Luhn algorithm', () => {
    expect(validateCreditCardLuhn('4532015112830366')).toBe(true);
    expect(validateCreditCardLuhn('4532015112830367')).toBe(false);
    expect(validateCreditCardLuhn('123')).toBe(false);
  });

  it('should validate future expiry MM/YY dates correctly', () => {
    expect(validateExpiryDate('12/29')).toBe(true);
    expect(validateExpiryDate('01/20')).toBe(false);
    expect(validateExpiryDate('13/28')).toBe(false);
    expect(validateExpiryDate('invalid')).toBe(false);
  });

  it('should validate US postal zip codes', () => {
    expect(validatePostalCode('90210', 'US')).toBe(true);
    expect(validatePostalCode('90210-1234', 'US')).toBe(true);
    expect(validatePostalCode('abc', 'US')).toBe(false);
  });

  it('should validate email addresses', () => {
    expect(validateEmail('customer@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should validate telephone numbers', () => {
    expect(validatePhone('+1 (555) 019-2834')).toBe(true);
    expect(validatePhone('123')).toBe(false);
  });
});
