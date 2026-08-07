/**
 * Recently Viewed Products Tracker
 * Persists a capped, de-duplicated, most-recent-first list of products into
 * localStorage and renders a "Recently Viewed" carousel on product pages.
 *
 * Exposed on window.RecentlyViewed for reuse and testing:
 *   - STORAGE_KEY, MAX_ITEMS
 *   - getRecentlyViewed()
 *   - addRecentlyViewed(product)
 *   - renderRecentlyViewed(options)
 */
(function (root) {
  'use strict';

  const STORAGE_KEY = 'recentlyViewed';
  const MAX_ITEMS = 10;

  function safeParseList(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getRecentlyViewed() {
    try {
      return safeParseList(root.localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return [];
    }
  }

  function saveRecentlyViewed(list) {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      // Ignore storage failures in restricted environments.
    }
  }

  /**
   * Adds or moves a product to the front of the recently-viewed list.
   * De-dupes by id when both entries have one, otherwise by name.
   * product: { id, name, price, image }
   */
  function addRecentlyViewed(product) {
    if (!product || typeof product.name !== 'string' || !product.name) {
      return getRecentlyViewed();
    }

    const entry = {
      id: product.id != null ? product.id : null,
      name: product.name,
      price: product.price != null ? product.price : null,
      image: product.image || '',
    };

    const list = getRecentlyViewed().filter((item) => {
      const sameId = entry.id != null && item.id != null && item.id === entry.id;
      const sameName = entry.id == null && item.name === entry.name;
      return !(sameId || sameName);
    });

    list.unshift(entry);
    const trimmed = list.slice(0, MAX_ITEMS);
    saveRecentlyViewed(trimmed);
    return trimmed;
  }

  function formatPrice(price) {
    if (typeof root.formatCurrency === 'function') {
      return root.formatCurrency(price);
    }
    if (typeof price === 'number' && isFinite(price)) {
      return '\u20B9' + Math.round(price).toLocaleString('en-IN');
    }
    return price ? String(price) : '';
  }

  function goToProduct(name) {
    try {
      root.localStorage.setItem('selectedProductId', name);
    } catch (e) {
      // Ignore storage errors, navigation still works.
    }
    root.location.href = 'singleProduct.html';
  }

  function buildCard(item, doc) {
    const card = doc.createElement('div');
    card.className = 'recently-viewed-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'View ' + item.name);

    card.addEventListener('click', () => goToProduct(item.name));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToProduct(item.name);
      }
    });

    const imgWrap = doc.createElement('div');
    imgWrap.className = 'pro-img-wrap';
    const img = doc.createElement('img');
    img.src = item.image || 'images/products/f1.jpg';
    img.alt = item.name;
    img.loading = 'lazy';
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    const des = doc.createElement('div');
    des.className = 'des';

    const name = doc.createElement('h5');
    name.textContent = item.name;
    des.appendChild(name);

    const price = doc.createElement('h4');
    price.textContent = formatPrice(item.price);
    des.appendChild(price);

    card.appendChild(des);
    return card;
  }

  /**
   * Renders the recently-viewed carousel into `containerId`.
   * Hides `sectionId` entirely when the (filtered) list is empty.
   * options: { containerId, sectionId, excludeId, excludeName, doc }
   */
  function renderRecentlyViewed(options) {
    options = options || {};
    const doc = options.doc || root.document;
    const container = doc.getElementById(options.containerId);
    if (!container) return [];

    const section = options.sectionId
      ? doc.getElementById(options.sectionId)
      : null;

    const list = getRecentlyViewed().filter((item) => {
      if (options.excludeId != null && item.id === options.excludeId) {
        return false;
      }
      if (options.excludeName && item.name === options.excludeName) {
        return false;
      }
      return true;
    });

    container.innerHTML = '';

    if (list.length === 0) {
      if (section) section.hidden = true;
      return list;
    }

    if (section) section.hidden = false;
    list.forEach((item) => container.appendChild(buildCard(item, doc)));
    return list;
  }

  function readCurrentProductFromDom(doc) {
    const nameEl = doc.getElementById('product-name');
    const name = nameEl ? nameEl.textContent.trim() : '';
    if (!name || name === 'Unable to load product') return null;
    return {
      id: null,
      name,
      price: doc.getElementById('product-price')
        ? doc.getElementById('product-price').textContent.trim()
        : null,
      image: doc.getElementById('MainImg')
        ? doc.getElementById('MainImg').getAttribute('src')
        : '',
    };
  }

  function initPage() {
    const doc = root.document;

    // Record the raw product id for pages that expose data-product-id.
    const productId = doc.body ? doc.body.getAttribute('data-product-id') : null;
    if (productId) {
      try {
        const history = safeParseList(
          root.localStorage.getItem('cara_view_history'),
        );
        if (!history.includes(productId)) {
          history.unshift(productId);
          root.localStorage.setItem(
            'cara_view_history',
            JSON.stringify(history.slice(0, MAX_ITEMS)),
          );
        }
      } catch (e) {
        // Ignore storage failures.
      }
    }

    if (!doc.getElementById('recently-viewed-container')) return;

    const current = readCurrentProductFromDom(doc);
    if (current) addRecentlyViewed(current);

    renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
      excludeId: current && current.id != null ? current.id : undefined,
      excludeName: current && current.id == null ? current.name : undefined,
    });
  }

  if (typeof root.document !== 'undefined') {
    root.document.addEventListener('DOMContentLoaded', initPage);
  }

  root.RecentlyViewed = {
    STORAGE_KEY,
    MAX_ITEMS,
    getRecentlyViewed,
    addRecentlyViewed,
    renderRecentlyViewed,
  };
})(typeof window !== 'undefined' ? window : globalThis);
