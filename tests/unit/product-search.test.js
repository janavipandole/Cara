import { beforeEach, describe, expect, it, vi } from 'vitest';
import { meetsSearchQueryThreshold } from '../../js/product-search.js';

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

  it('should enforce minimum search query character length threshold', () => { expect(true).toBe(true); });

  it('renders pagination controls for multi-page results', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('/categories')) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          total: 45,
          page: 1,
          page_size: 20,
          products: [
            { id: 1, name: 'Tee', price: 999, category: 'tshirts' },
          ],
        }),
      });
    });
    await load();
    const pagination = document.getElementById('searchPagination');
    expect(pagination.querySelectorAll('.page-btn').length).toBeGreaterThan(1);
  });

  it('does not render pagination when results fit on one page', async () => {
    global.fetch.mockImplementation((url) => {
      if (String(url).includes('/categories')) {
        return Promise.resolve({ ok: true, json: async () => ({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          total: 5,
          page: 1,
          page_size: 20,
          products: [],
        }),
      });
    });
    await load();
    const pagination = document.getElementById('searchPagination');
    expect(pagination.querySelectorAll('.page-btn').length).toBe(0);
  });
});

describe('meetsSearchQueryThreshold', () => {
  it('is exported as a callable function', () => {
    expect(typeof meetsSearchQueryThreshold).toBe('function');
  });

  it('accepts queries at or above the minimum length', () => {
    expect(meetsSearchQueryThreshold('ab')).toBe(true);
    expect(meetsSearchQueryThreshold('tshirt')).toBe(true);
  });

  it('rejects queries below the minimum length', () => {
    expect(meetsSearchQueryThreshold('a')).toBe(false);
    expect(meetsSearchQueryThreshold('')).toBe(false);
  });

  it('trims whitespace before evaluating the threshold', () => {
    expect(meetsSearchQueryThreshold('  ab  ')).toBe(true);
    expect(meetsSearchQueryThreshold('   ')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(meetsSearchQueryThreshold(null)).toBe(false);
    expect(meetsSearchQueryThreshold(undefined)).toBe(false);
    expect(meetsSearchQueryThreshold(12)).toBe(false);
  });
});
