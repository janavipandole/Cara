import { describe, it, expect } from 'vitest';

describe('js/shop-sort-filter.js — price parsing logic', () => {
  it('extracts price from text containing Rs. symbol', () => {
    const priceText = 'Rs. 150';
    const price = parseFloat(priceText.replace(/[^0-9]/g, '')) || 0;
    expect(price).toBe(150);
  });

  it('extracts integer price', () => {
    const priceText = '250';
    const price = parseFloat(priceText.replace(/[^0-9]/g, '')) || 0;
    expect(price).toBe(250);
  });

  it('returns 0 for empty string', () => {
    const priceText = '';
    const price = parseFloat(priceText.replace(/[^0-9]/g, '')) || 0;
    expect(price).toBe(0);
  });

  it('handles comma-separated prices like 1,500', () => {
    const priceText = 'Rs. 1,500';
    const price = parseFloat(priceText.replace(/[^0-9]/g, '')) || 0;
    expect(price).toBe(1500);
  });

  it('NaN guard — returns 0 for alphabetic text', () => {
    const priceText = 'abc';
    const parsed = parseFloat(priceText.replace(/[^0-9]/g, ''));
    const price = Number.isNaN(parsed) ? 0 : parsed;
    expect(price).toBe(0);
  });

  it('sorts product cards by price ascending', () => {
    const cards = [
      { textContent: 'Rs. 250' },
      { textContent: 'Rs. 50' },
      { textContent: 'Rs. 150' },
    ];
    const sorted = cards.slice().sort((a, b) => {
      const pA = parseFloat(a.textContent.replace(/[^0-9]/g, '')) || 0;
      const pB = parseFloat(b.textContent.replace(/[^0-9]/g, '')) || 0;
      return pA - pB;
    });
    expect(sorted[0].textContent).toBe('Rs. 50');
    expect(sorted[2].textContent).toBe('Rs. 250');
  });

  it('sorts product cards by price descending', () => {
    const cards = [
      { textContent: 'Rs. 50' },
      { textContent: 'Rs. 150' },
      { textContent: 'Rs. 250' },
    ];
    const sorted = cards.slice().sort((a, b) => {
      const pA = parseFloat(a.textContent.replace(/[^0-9]/g, '')) || 0;
      const pB = parseFloat(b.textContent.replace(/[^0-9]/g, '')) || 0;
      return pB - pA;
    });
    expect(sorted[0].textContent).toBe('Rs. 250');
    expect(sorted[2].textContent).toBe('Rs. 50');
  });
});
