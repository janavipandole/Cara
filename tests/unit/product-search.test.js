import { beforeEach, describe, expect, it, vi } from 'vitest';

function setupDom() {
  document.body.innerHTML = `
    <input id="productSearchInput">
    <select id="filterCategory"></select>
    <div id="productGrid"></div>
    <div id="searchResultCount"></div>
    <div id="searchPagination"></div>
    <div id="searchLoader"></div>
  `;
}

beforeEach(() => {
  vi.useRealTimers(); // Reset any fake timers from other tests
  vi.resetModules();
  setupDom();
  global.fetch = vi.fn();
});

async function load() {
  await import('../../js/product-search.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
  await new Promise((r) => setTimeout(r, 0));
}

describe('product-search', () => {
  it('exposes __productSearchProcessWithYield and __productSearchYieldForInput', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('/categories')) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true, json: async () => ({ total: 0, page: 1, page_size: 20, products: [] }),
      });
    });
    await load();
    expect(typeof window.__productSearchProcessWithYield).toBe('function');
    expect(typeof window.__productSearchYieldForInput).toBe('function');
  });

  it('processes items with processWithYield helper without hanging', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('/categories')) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true, json: async () => ({ total: 0, page: 1, page_size: 20, products: [] }),
      });
    });
    await load();
    const processWithYield = window.__productSearchProcessWithYield;
    const items = [1, 2, 3, 4, 5];
    // Test that processWithYield calls the process function on each item
    const called = [];
    await processWithYield(items, 2, (x) => { called.push(x); return x * 2; });
    expect(called).toEqual([1, 2, 3, 4, 5]);
  });

  it('populates the category dropdown from the categories endpoint', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categories: ['Men', 'Women'] }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ total: 0, page: 1, page_size: 20, products: [] }),
      });
    });
    await load();
    expect(document.getElementById('filterCategory').textContent).toContain(
      'Men',
    );
  });

  it('issues a search request on initial page load', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('/categories')) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ total: 0, page: 1, page_size: 20, products: [] }),
      });
    });
    await load();
    const searchCalls = global.fetch.mock.calls.filter(([url]) =>
      String(url).includes('/search/query'),
    );
    expect(searchCalls.length).toBeGreaterThan(0);
  });
});
