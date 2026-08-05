import { beforeEach, describe, expect, it, vi } from 'vitest';

function setupDom() {
  document.body.innerHTML = `
    <span id="analyticsRevenue"></span>
    <span id="analyticsOrders"></span>
    <span id="analyticsCustomers"></span>
    <table id="analyticsCategoryTable"></table>
    <div id="analyticsStatusWrap"></div>
    <div id="analyticsError"></div>
  `;
}

const ok = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

const deny = () => ({ ok: false, status: 403 });

function mockEndpoints(resolvers) {
  global.fetch.mockImplementation((url) =>
    Promise.resolve(resolvers[url] || ok([])),
  );
}

beforeEach(() => {
  vi.resetModules();
  setupDom();
  global.fetch = vi.fn();
});

async function load() {
  await import('../../js/admin-analytics.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
  await new Promise((r) => setTimeout(r, 0));
}

describe('admin-analytics', () => {
  it('renders the revenue summary from the summary endpoint', async () => {
    mockEndpoints({
      '/api/admin/analytics/summary': ok({
        total_revenue: 1000,
        total_orders: 5,
        total_customers: 3,
      }),
    });
    await load();
    expect(document.getElementById('analyticsRevenue').textContent).toContain(
      '1,000.00',
    );
    expect(document.getElementById('analyticsOrders').textContent).toBe('5');
  });

  it('renders the category sales table rows', async () => {
    mockEndpoints({
      '/api/admin/analytics/category-sales': ok([
        { category: 'shirts', units_sold: 2, revenue: 500 },
      ]),
    });
    await load();
    expect(
      document.getElementById('analyticsCategoryTable').textContent,
    ).toContain('SHIRTS');
  });

  it('renders the order status distribution', async () => {
    mockEndpoints({
      '/api/admin/analytics/order-status-distribution': ok([
        { status: 'Delivered', count: 5 },
      ]),
    });
    await load();
    expect(document.getElementById('analyticsStatusWrap').textContent).toContain(
      'Delivered',
    );
  });

  it('shows the error alert for a 403 response', async () => {
    global.fetch.mockImplementation(() => Promise.resolve(deny()));
    await load();
    expect(document.getElementById('analyticsError').style.display).toBe(
      'block',
    );
  });
});
