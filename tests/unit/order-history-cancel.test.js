/**
 * order-history.js — the Cancel action must only be rendered for
 * cancellable (pre-fulfillment) order statuses, mirroring the backend
 * CANCELLABLE_STATUSES allowlist.
 *
 * Regression tests for https://github.com/janavipandole/Cara/issues/5625
 *
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

function setupPage() {
  document.body.innerHTML = `
    <div id="loadingState"></div>
    <div id="errorState"></div>
    <div id="emptyState"></div>
    <div id="ordersCard"></div>
    <div id="errorText"></div>
    <div id="retryButton"></div>
    <div id="closeModalBtn"></div>
    <div id="orderModal"></div>
    <table><tbody id="ordersTableBody"></tbody></table>
  `;
}

function stubOrdersFetch(orders) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => orders,
  });
}

describe('order-history cancel button visibility', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    setupPage();
  });

  it('renders Cancel only for PENDING and CONFIRMED orders', async () => {
    const orders = [
      { id: 1, status: 'CONFIRMED', created_at: '2026-08-01', total_amount: 500 },
      { id: 2, status: 'PENDING', created_at: '2026-08-02', total_amount: 500 },
      { id: 3, status: 'SHIPPED', created_at: '2026-08-03', total_amount: 500 },
      { id: 4, status: 'DELIVERED', created_at: '2026-08-04', total_amount: 500 },
      { id: 5, status: 'CANCELLED', created_at: '2026-08-05', total_amount: 500 },
    ];
    stubOrdersFetch(orders);

    await import('../../order-history.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Let the async fetchOrders() settle.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const tbody = document.getElementById('ordersTableBody');
    const rows = tbody.querySelectorAll('tr');
    expect(rows.length).toBe(5);

    const cancellableIds = [...tbody.querySelectorAll('.cancel-btn')].map(
      (btn) => btn.dataset.orderId,
    );
    expect(cancellableIds).toEqual(['1', '2']);
    expect(tbody.querySelector('tr:nth-child(3) .cancel-btn')).toBeNull();
    expect(tbody.querySelector('tr:nth-child(4) .cancel-btn')).toBeNull();
    expect(tbody.querySelector('tr:nth-child(5) .cancel-btn')).toBeNull();
  });

  it('shows the empty state when there are no orders', async () => {
    stubOrdersFetch([]);

    await import('../../order-history.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const emptyState = document.getElementById('emptyState');
    expect(emptyState.style.display).not.toBe('none');
  });

  it('treats statuses case-insensitively when deciding cancellability', async () => {
    const orders = [
      { id: 1, status: 'pending', created_at: '2026-08-01', total_amount: 100 },
      { id: 2, status: 'Confirmed', created_at: '2026-08-02', total_amount: 100 },
      { id: 3, status: 'SHIPPED', created_at: '2026-08-03', total_amount: 100 },
    ];
    stubOrdersFetch(orders);

    await import('../../order-history.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const tbody = document.getElementById('ordersTableBody');
    const cancellableIds = [...tbody.querySelectorAll('.cancel-btn')].map(
      (btn) => btn.dataset.orderId,
    );
    expect(cancellableIds).toEqual(['1', '2']);
  });

  it('renders the error state when the orders fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await import('../../order-history.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const errorState = document.getElementById('errorState');
    expect(errorState.style.display).not.toBe('none');
  });
});
