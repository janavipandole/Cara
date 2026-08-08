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

  it('should enforce minimum search query character length threshold', () => {
    expect(meetsSearchQueryThreshold('shirt')).toBe(true);
    expect(meetsSearchQueryThreshold('sh')).toBe(true);
    expect(meetsSearchQueryThreshold('s')).toBe(false);
  });
});

describe('meetsSearchQueryThreshold', () => {
  it('is exported as a callable function', () => {
    expect(typeof meetsSearchQueryThreshold).toBe('function');
  });

  it('returns false for empty, null, or non-string queries', () => {
    expect(meetsSearchQueryThreshold('')).toBe(false);
    expect(meetsSearchQueryThreshold('   ')).toBe(false);
    expect(meetsSearchQueryThreshold(null)).toBe(false);
    expect(meetsSearchQueryThreshold(undefined)).toBe(false);
    expect(meetsSearchQueryThreshold(42)).toBe(false);
  });

  it('respects a custom minimum length', () => {
    expect(meetsSearchQueryThreshold('ab', 3)).toBe(false);
    expect(meetsSearchQueryThreshold('abc', 3)).toBe(true);
  });
});
