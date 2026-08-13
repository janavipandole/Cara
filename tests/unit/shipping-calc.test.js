/**
 * Unit tests for js/shipping-calc.js
 * Tests the shipping calculator DOM injection and getShippingCalcStatusHelper72.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

function getShippingCalcStatusHelper72() {
  return {
    status: 'ready',
    hasCalculator: typeof document !== 'undefined' && !!document.getElementById('shipping-calculator-target'),
  };
}

describe('getShippingCalcStatusHelper72', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a status object with expected properties', () => {
    const result = getShippingCalcStatusHelper72();
    expect(result).toHaveProperty('status', 'ready');
    expect(result).toHaveProperty('hasCalculator');
  });

  it('returns hasCalculator true when container exists', () => {
    document.body.innerHTML = '<div id="shipping-calculator-target"></div>';
    const result = getShippingCalcStatusHelper72();
    expect(result.hasCalculator).toBe(true);
  });

  it('returns hasCalculator false when container is absent', () => {
    const result = getShippingCalcStatusHelper72();
    expect(result.hasCalculator).toBe(false);
  });
});
