import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('shop-sort-filter.js — price filter and sort', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="shop-products-container">
        <div class="pro"><h4>Rs. 50</h4></div>
        <div class="pro"><h4>Rs. 150</h4></div>
        <div class="pro"><h4>Rs. 99</h4></div>
        <div class="pro"><h4>Rs. 200</h4></div>
        <div class="pro"><h4></h4></div>
        <div class="pro"><h4>No price here</h4></div>
      </div>
    `;
  });

  afterEach(() => {
    vi.resetModules();
  });

  function getVisiblePrices() {
    return Array.from(document.querySelectorAll('.pro h4')).map(
      (el) => el.textContent,
    );
  }

  it('all items visible when filter is set to "all"', async () => {
    vi.resetModules();
    await import('../../js/shop-sort-filter.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('price-filter').value = 'all';
    document.getElementById('catalog-sorter').value = 'default';
    document.getElementById('price-filter').dispatchEvent(new Event('change'));
    expect(getVisiblePrices()).toHaveLength(6);
  });

  it('shows only items under Rs.100 when filter is "low"', async () => {
    vi.resetModules();
    await import('../../js/shop-sort-filter.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('price-filter').value = 'low';
    document.getElementById('price-filter').dispatchEvent(new Event('change'));
    const visible = getVisiblePrices();
    // Rs.50 (50 < 100), Rs.99 (99 < 100), empty/NaN items (NaN=0 < 100)
    expect(visible).toContain('Rs. 50');
    expect(visible).toContain('Rs. 99');
    expect(visible).toContain('');
    expect(visible).toContain('No price here');
    expect(visible).not.toContain('Rs. 150');
    expect(visible).not.toContain('Rs. 200');
  });

  it('shows only items Rs.100 and above when filter is "high"', async () => {
    vi.resetModules();
    await import('../../js/shop-sort-filter.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('price-filter').value = 'high';
    document.getElementById('price-filter').dispatchEvent(new Event('change'));
    const visible = getVisiblePrices();
    expect(visible).toContain('Rs. 150');
    expect(visible).toContain('Rs. 200');
    expect(visible).not.toContain('Rs. 50');
    expect(visible).not.toContain('Rs. 99');
  });

  it('items with no parseable price treated as 0 and included in "low" filter', async () => {
    vi.resetModules();
    await import('../../js/shop-sort-filter.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('price-filter').value = 'low';
    document.getElementById('price-filter').dispatchEvent(new Event('change'));
    const visible = getVisiblePrices();
    // Empty and non-numeric text: parseFloat = NaN => 0 => 0 < 100 => included
    expect(visible).toContain('');
    expect(visible).toContain('No price here');
  });

  it('sort ascending puts lowest parseable price first', async () => {
    vi.resetModules();
    await import('../../js/shop-sort-filter.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('price-filter').value = 'all';
    document.getElementById('catalog-sorter').value = 'asc';
    document
      .getElementById('catalog-sorter')
      .dispatchEvent(new Event('change'));
    const visible = getVisiblePrices();
    // NaN items (price=0) sort before real prices in ascending
    expect(visible[0]).toBe('');
  });

  it('sort descending puts highest price first', async () => {
    vi.resetModules();
    await import('../../js/shop-sort-filter.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('price-filter').value = 'all';
    document.getElementById('catalog-sorter').value = 'desc';
    document
      .getElementById('catalog-sorter')
      .dispatchEvent(new Event('change'));
    const visible = getVisiblePrices();
    expect(visible[0]).toBe('Rs. 200');
  });

  it('filter and sort can be combined', async () => {
    vi.resetModules();
    await import('../../js/shop-sort-filter.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.getElementById('price-filter').value = 'low';
    document.getElementById('catalog-sorter').value = 'desc';
    document.getElementById('price-filter').dispatchEvent(new Event('change'));
    document
      .getElementById('catalog-sorter')
      .dispatchEvent(new Event('change'));
    const visible = getVisiblePrices();
    // "low": prices < 100 = Rs.50, Rs.99, NaN items; desc: highest first = Rs.99
    expect(visible[0]).toBe('Rs. 99');
  });
});
