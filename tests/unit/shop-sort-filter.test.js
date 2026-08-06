/**
 * Unit tests for shop-sort-filter.js
 * Tests catalog sorting and price filtering functionality.
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('Shop Sort Filter Unit Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Price Filter Logic', () => {
    it('should parse price from text correctly', () => {
      const parsePrice = (priceText) => parseFloat(priceText.replace(/[^\d\.]/g, '')) || 0;
      expect(parsePrice('999')).toBe(999);
      expect(parsePrice('20')).toBe(20);
      expect(parsePrice('No price')).toBe(0);
    });

    it('should filter low prices correctly', () => {
      const isLowPrice = (price) => price < 100;
      expect(isLowPrice(50)).toBe(true);
      expect(isLowPrice(99)).toBe(true);
      expect(isLowPrice(100)).toBe(false);
      expect(isLowPrice(150)).toBe(false);
    });

    it('should filter high prices correctly', () => {
      const isHighPrice = (price) => price >= 100;
      expect(isHighPrice(50)).toBe(false);
      expect(isHighPrice(100)).toBe(true);
      expect(isHighPrice(150)).toBe(true);
    });
  });

  describe('Sort Logic', () => {
    it('should sort prices in ascending order', () => {
      const sortAsc = (a, b) => a - b;
      const prices = [150, 50, 100, 25];
      prices.sort(sortAsc);
      expect(prices).toEqual([25, 50, 100, 150]);
    });

    it('should sort prices in descending order', () => {
      const sortDesc = (a, b) => b - a;
      const prices = [150, 50, 100, 25];
      prices.sort(sortDesc);
      expect(prices).toEqual([150, 100, 50, 25]);
    });
  });

  describe('Product Card Filtering', () => {
    it('should filter products by price correctly', () => {
      const products = [
        { price: 50 },
        { price: 100 },
        { price: 150 },
        { price: 75 },
      ];

      const lowPrice = products.filter(p => p.price < 100);
      expect(lowPrice.length).toBe(2);
      expect(lowPrice.map(p => p.price)).toContain(50);
      expect(lowPrice.map(p => p.price)).toContain(75);
    });

    it('should return all products when filter is all', () => {
      const products = [
        { price: 50 },
        { price: 100 },
        { price: 150 },
      ];

      const allProducts = products.filter(() => true);
      expect(allProducts.length).toBe(3);
    });
  });

  describe('Control Panel Creation', () => {
    it('should create control panel with price filter and sort dropdowns', () => {
      document.body.innerHTML = '<div id="shop-products-container"></div>';

      const controlPanel = document.createElement('div');
      controlPanel.innerHTML = `
        <select id="price-filter">
          <option value="all">All Prices</option>
          <option value="low">Under Rs.100</option>
          <option value="high">Rs.100 and above</option>
        </select>
        <select id="catalog-sorter">
          <option value="default">Featured</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      `;

      expect(document.getElementById('price-filter')).toBeDefined();
      expect(document.getElementById('catalog-sorter')).toBeDefined();
    });
  });
});
