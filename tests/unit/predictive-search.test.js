import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const suggestions = [
  {
    id: 1,
    name: 'Classic Tee',
    brand: 'Cara',
    price: 999,
    img: 'img1.jpg',
    rating: 4,
    category: 'minimal',
  },
  {
    id: 2,
    name: 'Denim Jacket',
    brand: 'Cara',
    price: 1999,
    img: 'img2.jpg',
    rating: 5,
    category: 'street',
  },
];

function setupDom() {
  document.body.innerHTML = `
    <div class="search-container">
      <input type="text" id="searchBar" placeholder="Search products...">
    </div>
  `;
}

function typeAndWait(query) {
  const input = document.getElementById('searchBar');
  input.value = query;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

async function loadModule() {
  await import('../../js/predictive-search.js');
  if (!document.getElementById('searchBar').dataset.predictiveWired) {
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }
}

const searchBar = () => document.getElementById('searchBar');
const panel = () => document.querySelector('.predictive-search-panel');

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  setupDom();
  localStorage.clear();
  delete window.CARA_API_BASE_URL;
  delete window.addToCart;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ query: 'classic', suggestions }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('predictive-search', () => {
  it('renders a suggestion panel when the user types a query', async () => {
    await loadModule();
    vi.useFakeTimers();
    typeAndWait('classic');
    await vi.advanceTimersByTimeAsync(300);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        '/api/products/search/predictive?q=classic&limit=3',
      ),
      expect.objectContaining({ credentials: 'include' }),
    );
    const p = panel();
    expect(p).not.toBeNull();
    expect(p.classList.contains('visible')).toBe(true);
    expect(p.querySelectorAll('.predictive-search-card').length).toBe(2);
    expect(p.textContent).toContain('Classic Tee');
    expect(p.textContent).toContain('₹999');
  });

  it('does not fetch for very short queries', async () => {
    await loadModule();
    vi.useFakeTimers();
    typeAndWait('a');
    await vi.advanceTimersByTimeAsync(300);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('hides the panel when there are no matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ query: 'zzz', suggestions: [] }),
      }),
    );
    await loadModule();
    vi.useFakeTimers();
    typeAndWait('zzz');
    await vi.advanceTimersByTimeAsync(300);

    const p = panel();
    expect(p === null || !p.classList.contains('visible')).toBe(true);
  });

  it('closes the panel on Escape', async () => {
    await loadModule();
    vi.useFakeTimers();
    typeAndWait('classic');
    await vi.advanceTimersByTimeAsync(300);

    expect(panel().classList.contains('visible')).toBe(true);
    searchBar().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(panel().classList.contains('visible')).toBe(false);
  });

  it('adds a suggestion to the cart via window.addToCart', async () => {
    window.addToCart = vi.fn();
    await loadModule();
    vi.useFakeTimers();
    typeAndWait('classic');
    await vi.advanceTimersByTimeAsync(300);

    const addBtn = panel().querySelector('.predictive-search-add');
    addBtn.click();
    expect(window.addToCart).toHaveBeenCalledWith(
      'Classic Tee',
      999,
      'img1.jpg',
      1,
      'Standard',
      1,
    );
  });

  it('navigates to the single product page when a card is clicked', async () => {
    await loadModule();
    vi.useFakeTimers();
    typeAndWait('classic');
    await vi.advanceTimersByTimeAsync(300);

    panel().querySelector('.predictive-search-card').click();
    const stored = JSON.parse(localStorage.getItem('selectedProduct'));
    expect(stored.id).toBe(1);
    expect(stored.name).toBe('Classic Tee');
  });
});
