import { describe, it, expect } from 'vitest';

// Test the exported validateGiftMessageLength function.
describe('gift-options', () => {
  it('should export validateGiftMessageLength', async () => {
    const mod = await import('../../js/gift-options.js');
    expect(typeof window.validateGiftMessageLength).toBe('function');
  });

  it('should return true for empty input', async () => {
    const mod = await import('../../js/gift-options.js');
    expect(window.validateGiftMessageLength(null)).toBe(true);
    expect(window.validateGiftMessageLength(undefined)).toBe(true);
    expect(window.validateGiftMessageLength('')).toBe(true);
  });

  it('should validate string length correctly', async () => {
    const mod = await import('../../js/gift-options.js');
    expect(window.validateGiftMessageLength('hello', 10)).toBe(true);
    expect(window.validateGiftMessageLength('hello world!', 5)).toBe(false);
  });

  it('should trim whitespace before checking length', async () => {
    const mod = await import('../../js/gift-options.js');
    expect(window.validateGiftMessageLength('  test  ', 6)).toBe(true);
    expect(window.validateGiftMessageLength('  test  ', 4)).toBe(false);
  });
});
