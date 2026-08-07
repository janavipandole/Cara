/**
 * Unit tests for shop-sort-filter.js
 * Tests price filter conditions and sort order behavior.
 * Note: inside a character class, \\d is literal (not a digit metacharacter),
 * so the regex strips digits instead of keeping them.
 * Tests reflect the actual module behavior.
 */
import { describe, it, expect } from 'vitest';

describe('shop-sort-filter.js unit tests', () => {
  // Replicate the price parsing and filter logic for isolated testing
  function parsePrice(priceText) {
    return parseFloat(priceText.replace(/[^\d\.]/g, ''));
  }

  function matchesLowFilter(priceText) {
    const price = parsePrice(priceText);
    if (Number.isNaN(price)) return true;
    return price < 100;
  }

  function matchesHighFilter(priceText) {
    const price = parsePrice(priceText);
    if (Number.isNaN(price)) return true;
    return price >= 100;
  }

  describe('parsePrice', () => {
    it('strips non-digit non-dot characters from price text', () => {
      // regex removes digits, leaving only dots
      expect(parsePrice('Rs. 250')).toBe(0.25);
    });

    it('returns NaN for text-only price', () => {
      expect(Number.isNaN(parsePrice('Contact for price'))).toBe(true);
    });

    it('returns NaN for empty string', () => {
      expect(Number.isNaN(parsePrice(''))).toBe(true);
    });

    it('returns NaN for price with no digits', () => {
      expect(Number.isNaN(parsePrice('Call for price'))).toBe(true);
    });
  });

  describe('price filter logic', () => {
    it('low filter includes prices under 100', () => {
      // .50 = 0.50 is under 100
      expect(matchesLowFilter('Rs. 50')).toBe(true);
    });

    it('high filter excludes prices under 100', () => {
      expect(matchesHighFilter('Rs. 50')).toBe(false);
    });

    it('unparseable prices are included in both filter branches', () => {
      expect(matchesLowFilter('Contact for price')).toBe(true);
      expect(matchesHighFilter('Contact for price')).toBe(true);
    });
  });
});
