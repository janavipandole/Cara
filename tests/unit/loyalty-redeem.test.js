import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function setupDom() {
  document.body.innerHTML = `
    <div id="loyalty-points-container">
      <p>Balance: <strong id="loyalty-balance">0</strong> pts</p>
      <p>Earn from order: <strong id="points-to-earn">0</strong> pts</p>
      <div>
        <input type="number" id="points-to-apply" />
        <button id="apply-points-btn">Redeem</button>
      </div>
      <p id="loyalty-msg"></p>
    </div>
    <div class="summary-breakdown">
      <div class="summary-row"><span>Subtotal</span><span id="summary-subtotal">₹1,000.00</span></div>
      <div class="summary-row"><span>Estimated Tax (18% GST)</span><span id="summary-tax">₹180.00</span></div>
      <div class="summary-row" id="summary-discount-row" style="display: none;"><span>Discount</span><span id="summary-discount">-₹0</span></div>
      <div class="summary-row" id="summary-loyalty-row" style="display: none;"><span>Redeemed Points</span><span id="summary-loyalty">-₹0</span></div>
      <div class="summary-row"><span>Shipping</span><span id="summary-shipping" class="shipping-free">FREE</span></div>
      <div class="summary-row"><span>Grand Total</span><span id="summary-total">₹1,180.00</span></div>
    </div>
  `;
}

function clickApply() {
  document.getElementById('apply-points-btn').click();
}

const msg = () => document.getElementById('loyalty-msg').textContent;
const balanceText = () => document.getElementById('loyalty-balance').textContent;
const totalText = () => document.getElementById('summary-total').textContent;

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllGlobals();
  setupDom();
  localStorage.clear();
  delete window.CaraLoyalty;
  delete window.CARA_CONFIG;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('js/loyalty.js redemption wiring', () => {
  it('applies points and persists them with a success message', async () => {
    localStorage.setItem('cara_loyalty_balance', '500');
    await import('../../js/loyalty.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('points-to-apply').value = '100';
    clickApply();

    expect(localStorage.getItem('cara_applied_loyalty_points')).toBe('100');
    expect(msg()).toContain('100 pts applied');
  });

  it('rejects points above the balance without persisting', async () => {
    localStorage.setItem('cara_loyalty_balance', '50');
    await import('../../js/loyalty.js');
    document.getElementById('points-to-apply').value = '100';
    const result = window.CaraLoyalty.applyPoints(100);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Insufficient points');
    expect(localStorage.getItem('cara_applied_loyalty_points')).toBeNull();
  });

  it('reflects the redemption discount in the cart summary', async () => {
    localStorage.setItem('cara_loyalty_balance', '500');
    await import('../../js/loyalty.js');
    window.CaraLoyalty.applyPoints(100); // ₹10 off
    window.CaraLoyalty.refresh();

    const row = document.getElementById('summary-loyalty-row');
    expect(row.style.display).not.toBe('none');
    expect(document.getElementById('summary-loyalty').textContent).toBe('-₹10.00');
    // 1000 + 180 - 10 = 1170
    expect(totalText()).toBe('₹1,170.00');
  });

  it('clears applied points via removeApplied', async () => {
    localStorage.setItem('cara_loyalty_balance', '500');
    localStorage.setItem('cara_applied_loyalty_points', '100');
    await import('../../js/loyalty.js');
    window.CaraLoyalty.removeApplied();

    expect(localStorage.getItem('cara_applied_loyalty_points')).toBeNull();
    const row = document.getElementById('summary-loyalty-row');
    expect(row.style.display).toBe('none');
    expect(totalText()).toBe('₹1,180.00');
  });

  it('converts points to a rupee discount at the configured rate', async () => {
    await import('../../js/loyalty.js');
    expect(window.CaraLoyalty.pointsToDiscount(50)).toBe(5);
    window.CARA_CONFIG = { LOYALTY: { POINTS_PER_RUPEE: 5, DEFAULT_BALANCE: 150 } };
    expect(window.CaraLoyalty.pointsToDiscount(50)).toBe(10);
  });

  it('prefers the authoritative server balance over the local cache', async () => {
    localStorage.setItem('cara_loyalty_balance', '150');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ balance: 420 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await import('../../js/loyalty.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    await vi.waitFor(() => expect(balanceText()).toBe('420'));
    expect(localStorage.getItem('cara_loyalty_balance')).toBe('420');
  });
});
