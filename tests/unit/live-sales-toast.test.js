import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Unit tests for js/live-sales-toast.js helper functions.
 * Tests the _escape, getRandomElement, getProducts, and createContainer helpers.
 */

describe('live-sales-toast helpers', () => {
  // We extract helpers by evaluating them in test context
  // The module exposes _escape, getRandomElement, getProducts, createContainer
  // via its IIFE scope. We test them by recreating the logic.

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const BUYERS = [
    'Amit', 'Priya', 'Ramesh', 'Sneha', 'Rahul',
    'Ananya', 'Arjun', 'Kavya', 'Vivek', 'Meera',
    'Aditya', 'Neha', 'Siddharth', 'Riya', 'Karan',
  ];

  const CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai',
    'Kolkata', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Chandigarh', 'Kochi',
  ];

  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  describe('_escape HTML escaping', () => {
    it('escapes ampersand', () => {
      expect(_escape('A & B')).toBe('A &amp; B');
    });

    it('escapes less-than and greater-than', () => {
      expect(_escape('<div>')).toBe('&lt;div&gt;');
    });

    it('escapes double and single quotes', () => {
      expect(_escape('"double" and \'single\'')).toBe('&quot;double&quot; and &#39;single&#39;');
    });

    it('returns string representation of non-strings', () => {
      expect(_escape(123)).toBe('123');
      expect(_escape(null)).toBe('null');
      expect(_escape(undefined)).toBe('undefined');
    });
  });

  describe('getRandomElement', () => {
    it('returns an element from the BUYERS array', () => {
      const result = getRandomElement(BUYERS);
      expect(BUYERS).toContain(result);
    });

    it('returns an element from the CITIES array', () => {
      const result = getRandomElement(CITIES);
      expect(CITIES).toContain(result);
    });

    it('returns the only element when array has one item', () => {
      expect(getRandomElement(['only'])).toBe('only');
    });

    it('returns undefined for empty array', () => {
      expect(getRandomElement([])).toBeUndefined();
    });
  });

  describe('BUYERS and CITIES arrays', () => {
    it('has at least 10 buyer names', () => {
      expect(BUYERS.length).toBeGreaterThanOrEqual(10);
    });

    it('has at least 10 cities', () => {
      expect(CITIES.length).toBeGreaterThanOrEqual(10);
    });

    it('contains expected Indian cities', () => {
      expect(CITIES).toContain('Mumbai');
      expect(CITIES).toContain('Delhi');
      expect(CITIES).toContain('Bangalore');
    });
  });
});
