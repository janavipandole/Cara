import { describe, it, expect } from 'vitest';
import {
  validateCreditCardLuhn,
  validateExpiryDate,
  validatePostalCode,
  validateEmail,
  validatePhone,
  validateCVVCode
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

  it('should validate Indian postal codes', () => {
    expect(validatePostalCode('110001', 'IN')).toBe(true);
    expect(validatePostalCode('12345', 'IN')).toBe(false);
    expect(validatePostalCode('1100012', 'IN')).toBe(false);
  });

  it('should validate UK postal codes', () => {
    expect(validatePostalCode('SW1A 1AA', 'UK')).toBe(true);
    expect(validatePostalCode('M1 1AE', 'UK')).toBe(true);
    expect(validatePostalCode('12345', 'UK')).toBe(false);
  });

  it('should validate Canadian postal codes', () => {
    expect(validatePostalCode('K1A 0B1', 'CA')).toBe(true);
    expect(validatePostalCode('K1A0B1', 'CA')).toBe(true);
    expect(validatePostalCode('12345', 'CA')).toBe(false);
  });

  it('should validate Australian postal codes', () => {
    expect(validatePostalCode('2000', 'AU')).toBe(true);
    expect(validatePostalCode('20001', 'AU')).toBe(false);
    expect(validatePostalCode('abc', 'AU')).toBe(false);
  });

  it('should fall back to length check for unknown countries', () => {
    expect(validatePostalCode('ABC-123', 'XX')).toBe(true);
    expect(validatePostalCode('ab', 'XX')).toBe(false);
  });

  it('should validate email addresses', () => {
    expect(validateEmail('customer@example.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should validate telephone numbers', () => {
    expect(validatePhone('+1 (555) 019-2834')).toBe(true);
    expect(validatePhone('123')).toBe(false);
  });

  it('should validate CVV numeric security code format', () => {
    expect(validateCVVCode('123')).toBe(true);
    expect(validateCVVCode('1234')).toBe(true);
    expect(validateCVVCode('12')).toBe(false);
    expect(validateCVVCode('12345')).toBe(false);
    expect(validateCVVCode('12a4')).toBe(false);
    expect(validateCVVCode('')).toBe(false);
  });

  it('should reject non-string CVV inputs', () => {
    expect(validateCVVCode(null)).toBe(false);
    expect(validateCVVCode(undefined)).toBe(false);
    expect(validateCVVCode(123)).toBe(false);
  });
});
