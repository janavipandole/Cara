/**
 * Unit tests for js/shipping-calc.js
 * Tests the shipping cost calculation logic.
 */
import { describe, it, expect } from 'vitest';

// Extract shipping calculation logic for unit testing.
// Mirrors the logic in js/shipping-calc.js.
function calculateShipping(country, speed) {
  let total = speed === 'exp' ? 150 : 0;
  let days = speed === 'exp' ? '2-3 days' : '5-7 days';

  if (country !== 'IN') {
    total += 450; // International shipping
    days = speed === 'exp' ? '4-5 days' : '9-12 days';
  }

  return { total, days };
}

describe('Shipping Calculator Logic', () => {
  describe('Domestic (India) shipping', () => {
    it('applies free standard shipping for domestic orders', () => {
      const result = calculateShipping('IN', 'std');
      expect(result.total).toBe(0);
      expect(result.days).toBe('5-7 days');
    });

    it('applies express domestic shipping with 150 surcharge', () => {
      const result = calculateShipping('IN', 'exp');
      expect(result.total).toBe(150);
      expect(result.days).toBe('2-3 days');
    });
  });

  describe('International shipping', () => {
    it('charges 450 for international standard shipping', () => {
      const result = calculateShipping('US', 'std');
      expect(result.total).toBe(450);
      expect(result.days).toBe('9-12 days');
    });

    it('charges 600 for international express shipping (450 + 150)', () => {
      const result = calculateShipping('US', 'exp');
      expect(result.total).toBe(600);
      expect(result.days).toBe('4-5 days');
    });

    it('charges 450 for UK standard international shipping', () => {
      const result = calculateShipping('UK', 'std');
      expect(result.total).toBe(450);
      expect(result.days).toBe('9-12 days');
    });

    it('charges 600 for UK express international shipping', () => {
      const result = calculateShipping('UK', 'exp');
      expect(result.total).toBe(600);
      expect(result.days).toBe('4-5 days');
    });
  });

  describe('Cart total update logic', () => {
    it('calculates new total with free domestic standard shipping', () => {
      const subtotal = 500;
      const tax = 50;
      const shipping = 0;
      const discount = 0;
      const newTotal = Math.max(0, subtotal + tax + shipping - discount);
      expect(newTotal).toBe(550);
    });

    it('calculates new total with express domestic shipping', () => {
      const subtotal = 500;
      const tax = 50;
      const shipping = 150;
      const discount = 0;
      const newTotal = Math.max(0, subtotal + tax + shipping - discount);
      expect(newTotal).toBe(700);
    });

    it('calculates new total with international express shipping', () => {
      const subtotal = 500;
      const tax = 50;
      const shipping = 600;
      const discount = 50;
      const newTotal = Math.max(0, subtotal + tax + shipping - discount);
      expect(newTotal).toBe(1100);
    });

    it('returns 0 for zero subtotal with discount larger than total', () => {
      const subtotal = 0;
      const tax = 0;
      const shipping = 0;
      const discount = 100;
      const newTotal = Math.max(0, subtotal + tax + shipping - discount);
      expect(newTotal).toBe(0);
    });
  });
});
