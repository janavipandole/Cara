import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  EXCHANGE_RATES,
  DEFAULT_EXCHANGE_RATES,
  getActiveCurrency,
  setActiveCurrency,
  convertPrice,
  formatCurrency,
  fetchExchangeRates,
} from '../../js/currency-converter.js';

describe('Currency Converter Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(EXCHANGE_RATES, DEFAULT_EXCHANGE_RATES);
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

  it('should fetch and cache exchange rates in localStorage with 12-hour TTL and reuse cache within TTL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.95, GBP: 0.82 } }),
    });

    const baseNow = Date.now();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(baseNow);

    const rates = await fetchExchangeRates(mockFetch);
    expect(rates.EUR).toBe(0.95);
    expect(rates.GBP).toBe(0.82);

    const cached = JSON.parse(
      localStorage.getItem('cara_exchange_rates_cache'),
    );
    expect(cached.rates.EUR).toBe(0.95);
    expect(cached.timestamp).toBe(baseNow);

    // Verify cache hit path within TTL doesn't call fetch again
    mockFetch.mockClear();
    const ratesFromCache = await fetchExchangeRates(mockFetch);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(ratesFromCache.EUR).toBe(0.95);

    // Verify TTL expiration (> 12 hours) triggers a new refetch
    nowSpy.mockReturnValue(baseNow + 12 * 60 * 60 * 1000 + 1000);
    const refetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.98, GBP: 0.85 } }),
    });

    const expiredRates = await fetchExchangeRates(refetchMock);
    expect(refetchMock).toHaveBeenCalledTimes(1);
    expect(expiredRates.EUR).toBe(0.98);

    nowSpy.mockRestore();
  });

  it('should round floating point results to 2 decimal places precision', () => {
    const price = convertPrice(19.99, 'USD');
    expect(price).toBe(19.99);
  });
});
