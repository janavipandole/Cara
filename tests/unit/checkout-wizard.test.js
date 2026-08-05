import { describe, expect, it, vi } from 'vitest';

describe('checkout-wizard', () => {
  it('initialises without throwing', async () => {
    vi.resetModules();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await import('../../js/checkout-wizard.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(true).toBe(true);
  });
});
