import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  EXCHANGE_RATES,
  getActiveCurrency,
  setActiveCurrency,
  convertPrice,
  formatCurrency
} from '../../js/currency-converter.js';

describe('Currency Converter Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default active currency to USD', () => {
    expect(getActiveCurrency()).toBe('USD');
  });

  it('should allow setting active currency to valid code and persist in localStorage', () => {
    const success = setActiveCurrency('EUR');
    expect(success).toBe(true);
    expect(getActiveCurrency()).toBe('EUR');
    expect(localStorage.getItem('cara_selected_currency')).toBe('EUR');
  });

  it('should reject invalid currency codes', () => {
    const success = setActiveCurrency('INVALID');
    expect(success).toBe(false);
    expect(getActiveCurrency()).toBe('USD');
  });

  it('should convert USD price to EUR correctly', () => {
    const converted = convertPrice(100, 'EUR');
    expect(converted).toBe(100 * EXCHANGE_RATES.EUR);
  });

  it('should format currency with proper symbol and decimal places', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
    expect(formatCurrency(100, 'EUR')).toBe('€92.00');
    expect(formatCurrency(100, 'GBP')).toBe('£79.00');
    expect(formatCurrency(100, 'INR')).toBe('₹8325.00');
  });
});
