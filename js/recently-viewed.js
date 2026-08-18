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
  const VISIBLE_LIMIT = 6;

  function safeParseList(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function getRecentlyViewed() {
    try {
      return safeParseList(root.localStorage.getItem(STORAGE_KEY));
    } catch {
      return [];
    }
  }

  function saveRecentlyViewed(list) {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeProduct(product) {
    if (!product || typeof product.name !== 'string' || !product.name.trim()) {
      return null;
    }

    const name = product.name.trim();
    const id = product.id != null && product.id !== '' ? product.id : null;
    const slug = product.slug ? String(product.slug).trim() : slugify(name);

    return {
      id,
      name,
      slug,
      price: product.price != null ? product.price : null,
      image: product.image || product.img || '',
    };
  }

  /**
   * Adds or moves a product to the front of the recently-viewed list.
   * De-dupes by id when both entries have one, otherwise by name.
   * product: { id, name, price, image }
   */
  function addRecentlyViewed(product) {
    const entry = normalizeProduct(product);
    if (!entry) {
      return getRecentlyViewed();
    }

    const list = getRecentlyViewed().filter((item) => {
      const sameId =
        entry.id != null && item.id != null && item.id === entry.id;
      const sameSlug =
        entry.slug && item.slug && String(item.slug) === String(entry.slug);
      const sameName =
        !entry.id && !entry.slug && String(item.name) === String(entry.name);
      return !(sameId || sameSlug || sameName);
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

  function goToProduct(item) {
    try {
      root.localStorage.setItem('selectedProductId', item.name);
      root.localStorage.setItem(
        'selectedProduct',
        JSON.stringify({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          slug: item.slug,
        }),
      );
    } catch {
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

    card.dataset.productSlug = item.slug || slugify(item.name);
    card.addEventListener('click', () => goToProduct(item));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToProduct(item);
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
      if (
        options.excludeSlug &&
        item.slug &&
        item.slug === options.excludeSlug
      ) {
        return false;
      }
      if (options.excludeName && item.name === options.excludeName) {
        return false;
      }
      return true;
    });

    const visibleList = list.slice(0, options.limit || VISIBLE_LIMIT);

    container.innerHTML = '';

    if (visibleList.length === 0) {
      if (section) section.hidden = true;
      return visibleList;
    }

    if (section) section.hidden = false;
    visibleList.forEach((item) => container.appendChild(buildCard(item, doc)));

    if (options.showClearButton !== false) {
      const clearButton = doc.createElement('button');
      clearButton.type = 'button';
      clearButton.className = 'recently-viewed-clear';
      clearButton.textContent = 'Clear';
      clearButton.setAttribute('aria-label', 'Clear recently viewed products');
      clearButton.addEventListener('click', () => {
        clearRecentlyViewed();
        renderRecentlyViewed(options);
      });
      container.appendChild(clearButton);
    }

    return visibleList;
  }

  function readCurrentProductFromStorage() {
    try {
      const raw = root.localStorage.getItem('selectedProduct');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return normalizeProduct(parsed);
    } catch {
      return null;
    }
  }

  function readCurrentProductFromDom(doc) {
    const nameEl = doc.getElementById('product-name');
    const name = nameEl ? nameEl.textContent.trim() : '';
    if (!name || name === 'Unable to load product') return null;
    return normalizeProduct({
      id: null,
      name,
      price: doc.getElementById('product-price')
        ? doc.getElementById('product-price').textContent.trim()
        : null,
      image: doc.getElementById('MainImg')
        ? doc.getElementById('MainImg').getAttribute('src')
        : '',
    });
  }

  function getCurrentProduct(doc) {
    if (
      root.location &&
      String(root.location.pathname).includes('singleProduct')
    ) {
      return readCurrentProductFromStorage() || readCurrentProductFromDom(doc);
    }
    return null;
  }

  function clearRecentlyViewed() {
    saveRecentlyViewed([]);
    return [];
  }

  function initPage() {
    const doc = root.document;

    // Record the raw product id for pages that expose data-product-id.
    const productId = doc.body
      ? doc.body.getAttribute('data-product-id')
      : null;
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
      } catch {
        // Ignore storage failures.
      }
    }

    if (!doc.getElementById('recently-viewed-container')) return;

    const current = getCurrentProduct(doc);
    if (current) addRecentlyViewed(current);

    renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
      excludeId: current && current.id != null ? current.id : undefined,
      excludeSlug: current && current.slug ? current.slug : undefined,
      excludeName: current && current.id == null ? current.name : undefined,
    });

    root.addEventListener('cara:single-product-ready', (event) => {
      const detail =
        event && event.detail ? normalizeProduct(event.detail) : null;
      if (!detail) return;
      addRecentlyViewed(detail);
      renderRecentlyViewed({
        containerId: 'recently-viewed-container',
        sectionId: 'recently-viewed-section',
        excludeId: detail.id != null ? detail.id : undefined,
        excludeSlug: detail.slug || undefined,
        excludeName: detail.id == null ? detail.name : undefined,
      });
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
    clearRecentlyViewed,
  };
})(typeof window !== 'undefined' ? window : globalThis);
