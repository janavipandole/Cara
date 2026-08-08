/**
 * compare.js — navigation from the comparison table must write the
 * storage contract that singleProduct.js reads ('selectedProduct'), while
 * keeping 'selectedProductId' for consumers like reviews.js.
 *
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const COMPARE_LIST_KEY = 'cara_compare_list';

function seedCompareList(list) {
  sessionStorage.setItem(COMPARE_LIST_KEY, JSON.stringify(list));
}

function setupPage() {
  document.body.innerHTML = `
    <div id="compareTableWrapper"></div>
    <div id="compareEmpty"></div>
    <div class="compare-actions"></div>
  `;
  const location = { href: 'compare.html' };
  vi.stubGlobal('location', location);
}

describe('compare.js view-product navigation', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    sessionStorage.clear();
    localStorage.clear();
    setupPage();
  });

  it('renders the comparison table from the stored list', async () => {
    seedCompareList([
      {
        id: 42,
        name: 'Cartoon Astronaut T-Shirts',
        price: '₹499',
        brand: 'Cara',
        img: 'img/products/f1.jpg',
        rating: 4,
      },
    ]);

    await import('../../compare.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const wrapper = document.getElementById('compareTableWrapper');
    expect(wrapper.style.display).toBe('block');
    expect(wrapper.querySelector('.compare-table')).toBeTruthy();
    expect(wrapper.querySelectorAll('[data-compare-view]').length).toBe(2);
  });

  it('writes the selectedProduct JSON contract on view-product click', async () => {
    seedCompareList([
      {
        id: 42,
        name: 'Cartoon Astronaut T-Shirts',
        price: '₹499',
        brand: 'Cara',
        img: 'img/products/f1.jpg',
        rating: 4,
      },
    ]);

    await import('../../compare.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const button = document.querySelector('[data-compare-view]');
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const stored = JSON.parse(localStorage.getItem('selectedProduct'));
    expect(stored).toEqual({
      id: 42,
      name: 'Cartoon Astronaut T-Shirts',
      price: '₹499',
      brand: 'Cara',
      image: 'img/products/f1.jpg',
    });
    expect(localStorage.getItem('selectedProductId')).toBe(
      'Cartoon Astronaut T-Shirts',
    );
    expect(window.location.href).toBe('singleProduct.html');
  });

  it('navigates to the clicked product from the table image as well', async () => {
    seedCompareList([
      { id: 7, name: 'Hoodie', price: '₹1200', brand: 'Cara', img: 'f.jpg' },
      { id: 9, name: 'Jeans', price: '₹1500', brand: 'Cara', img: 'j.jpg' },
    ]);

    await import('../../compare.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const images = document.querySelectorAll('img[data-compare-view]');
    expect(images.length).toBe(2);
    images[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const stored = JSON.parse(localStorage.getItem('selectedProduct'));
    expect(stored.id).toBe(9);
    expect(stored.name).toBe('Jeans');
  });
});
