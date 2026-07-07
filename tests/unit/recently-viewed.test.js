/**
 * Unit tests for the Recently Viewed Products feature (js/recently-viewed.js).
 *
 * Loads the real source module (vitest's jsdom environment provides
 * `window`, `document`, and `localStorage` as ambient globals) and exercises
 * the public API exposed on `window.RecentlyViewed`.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import '../../js/recently-viewed.js';

const RecentlyViewed = window.RecentlyViewed;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  expect(RecentlyViewed).toBeTruthy();
});

function product(overrides) {
  return {
    id: 1,
    name: 'Tropical Hibiscus Summer Shirt',
    price: 2499,
    image: 'images/products/f1.jpg',
    ...overrides,
  };
}

describe('addRecentlyViewed', () => {
  it('adds a product to the front of an empty list', () => {
    const list = RecentlyViewed.addRecentlyViewed(product());
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: 1,
      name: 'Tropical Hibiscus Summer Shirt',
    });
  });

  it('persists the list to localStorage', () => {
    RecentlyViewed.addRecentlyViewed(product());
    const stored = JSON.parse(localStorage.getItem(RecentlyViewed.STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Tropical Hibiscus Summer Shirt');
  });

  it('moves a re-viewed product to the front instead of duplicating it (dedupe by id)', () => {
    RecentlyViewed.addRecentlyViewed(product({ id: 1, name: 'A' }));
    RecentlyViewed.addRecentlyViewed(product({ id: 2, name: 'B' }));
    const list = RecentlyViewed.addRecentlyViewed(
      product({ id: 1, name: 'A' })
    );

    expect(list).toHaveLength(2);
    expect(list[0].name).toBe('A');
    expect(list[1].name).toBe('B');
  });

  it('dedupes by name when no id is available', () => {
    RecentlyViewed.addRecentlyViewed({
      id: null,
      name: 'No Id Product',
      price: 100,
      image: 'x.jpg',
    });
    const list = RecentlyViewed.addRecentlyViewed({
      id: null,
      name: 'No Id Product',
      price: 100,
      image: 'x.jpg',
    });
    expect(list).toHaveLength(1);
  });

  it('caps the list at MAX_ITEMS, dropping the oldest entries', () => {
    for (let i = 1; i <= RecentlyViewed.MAX_ITEMS + 3; i++) {
      RecentlyViewed.addRecentlyViewed(
        product({ id: i, name: `Product ${i}` })
      );
    }
    const list = RecentlyViewed.getRecentlyViewed();
    expect(list).toHaveLength(RecentlyViewed.MAX_ITEMS);
    expect(list[0].name).toBe(`Product ${RecentlyViewed.MAX_ITEMS + 3}`);
  });

  it('ignores invalid input without throwing', () => {
    expect(() => RecentlyViewed.addRecentlyViewed(null)).not.toThrow();
    expect(() => RecentlyViewed.addRecentlyViewed({})).not.toThrow();
    expect(RecentlyViewed.getRecentlyViewed()).toHaveLength(0);
  });
});

describe('renderRecentlyViewed', () => {
  function setUpDom() {
    document.body.innerHTML = `
            <section id="recently-viewed-section" hidden>
                <div id="recently-viewed-container"></div>
            </section>
        `;
  }

  it('hides the section when there is nothing to show', () => {
    setUpDom();
    RecentlyViewed.renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
    });

    const section = document.getElementById('recently-viewed-section');
    expect(section.hidden).toBe(true);
    expect(
      document.getElementById('recently-viewed-container').children
    ).toHaveLength(0);
  });

  it('reveals the section and renders a card per stored product', () => {
    setUpDom();
    RecentlyViewed.addRecentlyViewed(product({ id: 1, name: 'A' }));
    RecentlyViewed.addRecentlyViewed(product({ id: 2, name: 'B' }));

    RecentlyViewed.renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
    });

    const section = document.getElementById('recently-viewed-section');
    const cards = document.getElementById('recently-viewed-container').children;
    expect(section.hidden).toBe(false);
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute('aria-label')).toBe('View B');
  });

  it('excludes the currently viewed product by id', () => {
    setUpDom();
    RecentlyViewed.addRecentlyViewed(product({ id: 1, name: 'A' }));
    RecentlyViewed.addRecentlyViewed(product({ id: 2, name: 'B' }));

    const list = RecentlyViewed.renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
      excludeId: 2,
    });

    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('A');
    expect(
      document.getElementById('recently-viewed-container').children
    ).toHaveLength(1);
  });

  it('re-hides the section if excluding the only item empties the list', () => {
    setUpDom();
    RecentlyViewed.addRecentlyViewed(product({ id: 1, name: 'Only Product' }));

    RecentlyViewed.renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
      excludeId: 1,
    });

    expect(document.getElementById('recently-viewed-section').hidden).toBe(
      true
    );
  });

  it('does nothing when the container is missing from the DOM', () => {
    document.body.innerHTML = '';
    expect(() =>
      RecentlyViewed.renderRecentlyViewed({
        containerId: 'does-not-exist',
        sectionId: 'also-missing',
      })
    ).not.toThrow();
  });
});
