import { describe, expect, it, vi } from 'vitest';
import { isValidStepBounds } from '../../js/checkout-wizard.js';

describe('checkout-wizard', () => {
  it('initialises without throwing', async () => {
    vi.resetModules();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await import('../../js/checkout-wizard.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });
});

describe('isValidStepBounds', () => {
  it('is exported as a callable function', () => {
    expect(typeof isValidStepBounds).toBe('function');
  });

  it('accepts step indices within the default bounds', () => {
    expect(isValidStepBounds(1)).toBe(true);
    expect(isValidStepBounds(4)).toBe(true);
  });

  it('rejects indices outside the default bounds', () => {
    expect(isValidStepBounds(0)).toBe(false);
    expect(isValidStepBounds(5)).toBe(false);
  });

  it('rejects non-number indices', () => {
    expect(isValidStepBounds('2')).toBe(false);
    expect(isValidStepBounds(null)).toBe(false);
    expect(isValidStepBounds(undefined)).toBe(false);
  });

  it('respects a custom maximum step count', () => {
    expect(isValidStepBounds(3, 3)).toBe(true);
    expect(isValidStepBounds(4, 3)).toBe(false);
  });
});
