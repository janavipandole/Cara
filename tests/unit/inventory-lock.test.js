import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Inventory Reservation & Lock Unit Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = `
      <div class="checkout-container"></div>
      <div id="summary-total">$100</div>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders stock reservation alert banner on checkout page', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'HOLD', hold_seconds: 600 }),
    });

    await import('../../js/checkout-timer.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const alertBar = document.getElementById('checkout-promo-alert-bar');
    expect(alertBar).not.toBeNull();
    expect(alertBar.textContent).toContain('Stock Reserved!');
  });
});
