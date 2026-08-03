/**
 * Recently Viewed Products Tracker
 */
(function (global) {
  const STORAGE_KEY = 'cara_recently_viewed';
  const MAX_ITEMS = 10;

  function getRecentlyViewed() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_e) {
      return [];
    }
  }

  function addRecentlyViewed(product) {
    if (!product || typeof product !== 'object') {
      return getRecentlyViewed();
    }
    if (product.id == null && !product.name) {
      return getRecentlyViewed();
    }

    const current = getRecentlyViewed();
    const filtered = current.filter((item) => {
      if (product.id != null && item.id != null) {
        return item.id !== product.id;
      }
      if (product.name && item.name) {
        return item.name !== product.name;
      }
      return true;
    });

    filtered.unshift(product);

    if (filtered.length > MAX_ITEMS) {
      filtered.length = MAX_ITEMS;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (_e) {
      // Storage quota or error handling
    }

    return filtered;
  }

  function renderRecentlyViewed(options = {}) {
    const { containerId, sectionId, excludeId } = options;
    const container = containerId ? document.getElementById(containerId) : null;
    const section = sectionId ? document.getElementById(sectionId) : null;

    if (!container) {
      return [];
    }

    let list = getRecentlyViewed();

    if (excludeId != null) {
      list = list.filter(
        (item) => item.id !== excludeId && item.name !== excludeId,
      );
    }

    if (list.length === 0) {
      if (section) section.hidden = true;
      container.innerHTML = '';
      return [];
    }

    if (section) section.hidden = false;
    container.innerHTML = '';

    list.forEach((prod) => {
      const card = document.createElement('div');
      card.className = 'recently-viewed-card';
      card.setAttribute('aria-label', `View ${prod.name || 'Product'}`);

      card.innerHTML = `
        <img src="${prod.image || ''}" alt="${prod.name || ''}" />
        <h4>${prod.name || ''}</h4>
        <span>₹${prod.price || 0}</span>
      `;
      container.appendChild(card);
    });

    return list;
  }

  const RecentlyViewed = {
    STORAGE_KEY,
    MAX_ITEMS,
    getRecentlyViewed,
    addRecentlyViewed,
    renderRecentlyViewed,
  };

  if (typeof window !== 'undefined') {
    window.RecentlyViewed = RecentlyViewed;
  }
  if (typeof global !== 'undefined') {
    global.RecentlyViewed = RecentlyViewed;
  }
})(typeof window !== 'undefined' ? window : globalThis);
