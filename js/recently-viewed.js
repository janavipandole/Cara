/**
 * Recently Viewed Products
 * ------------------------
 * Persists a capped, de-duplicated, most-recent-first list of products the
 * user has opened on singleProduct.html into localStorage, and renders a
 * horizontal "Recently Viewed" carousel on singleProduct.html and shop.html.
 *
 * Storage shape (localStorage key: "recentlyViewed"):
 *   [{ id, name, price, image }, ...]   // newest first, max 6 items
 *
 * Exposed on window.RecentlyViewed for reuse/testing:
 *   - STORAGE_KEY, MAX_ITEMS
 *   - getRecentlyViewed()
 *   - addRecentlyViewed(product)
 *   - renderRecentlyViewed(options)
 */
(function (root) {
  'use strict';

  var STORAGE_KEY = 'recentlyViewed';
  var MAX_ITEMS = 6;
  var memoryFallbackList = [];

  function safeParseList(raw) {
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getRecentlyViewed() {
    try {
      if (typeof localStorage !== 'undefined') {
        return safeParseList(localStorage.getItem(STORAGE_KEY));
      }
    } catch (e) {
      /* ignore storage exception, return memory fallback */
    }
    return memoryFallbackList;
  }

  function saveRecentlyViewed(list) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return true;
      }
    } catch (e) {
      if (typeof root.logError === 'function') {
        root.logError('Failed to save recently viewed products:', e);
      }
    }
    memoryFallbackList = list;
    return false;
  }

  /**
   * Adds/moves a product to the front of the recently-viewed list.
   * De-dupes by id when both entries have one, otherwise falls back to name.
   * product: { id, name, price, image }
   */
  function addRecentlyViewed(product) {
    if (!product || !product.name) return getRecentlyViewed();

    var entry = {
      id: product.id != null ? product.id : null,
      name: product.name,
      price: product.price != null ? product.price : null,
      image: product.image || '',
    };

    var list = getRecentlyViewed().filter(function (item) {
      var sameId = entry.id != null && item.id != null && item.id === entry.id;
      var sameName = item.name === entry.name;
      return !(sameId || (entry.id == null && sameName));
    });

    list.unshift(entry);
    if (list.length > MAX_ITEMS) list = list.slice(0, MAX_ITEMS);

    saveRecentlyViewed(list);
    return list;
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
      localStorage.setItem('selectedProductId', name);
    } catch (e) {
      /* ignore storage errors, navigation still works */
    }
    root.location.href = 'singleProduct.html';
  }

  function buildCard(item, doc) {
    var card = doc.createElement('div');
    card.className = 'recently-viewed-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'View ' + item.name);

    card.addEventListener('click', function () {
      goToProduct(item.name);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToProduct(item.name);
      }
    });

    var imgWrap = doc.createElement('div');
    imgWrap.className = 'pro-img-wrap';
    var img = doc.createElement('img');
    img.src = item.image || 'images/products/f1.jpg';
    img.alt = item.name;
    img.loading = 'lazy';
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    var des = doc.createElement('div');
    des.className = 'des';

    var name = doc.createElement('h5');
    name.textContent = item.name;
    des.appendChild(name);

    var price = doc.createElement('h4');
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
    var doc = options.doc || document;
    var container = doc.getElementById(options.containerId);
    if (!container) return [];

    var section = options.sectionId
      ? doc.getElementById(options.sectionId)
      : null;

    var list = getRecentlyViewed().filter(function (item) {
      if (options.excludeId != null) return item.id !== options.excludeId;
      if (options.excludeName) return item.name !== options.excludeName;
      return true;
    });

    container.innerHTML = '';

    if (list.length === 0) {
      if (section) section.hidden = true;
      return list;
    }

    if (section) section.hidden = false;
    list.forEach(function (item) {
      container.appendChild(buildCard(item, doc));
    });

    return list;
  }

  // ---- Page wiring -------------------------------------------------

  function getStaticProductByName(name) {
    var list =
      typeof products !== 'undefined' && Array.isArray(products) // eslint-disable-line no-undef
        ? products // eslint-disable-line no-undef
        : Array.isArray(root.products)
          ? root.products
          : [];
    var match = list.filter(function (p) {
      return p.name === name;
    })[0];
    return match
      ? { id: match.id, name: match.name, price: match.price, image: match.img }
      : null;
  }

  function readCurrentProductFromDom(doc) {
    var nameEl = doc.getElementById('product-name');
    var imgEl = doc.getElementById('MainImg');
    var name = nameEl ? nameEl.textContent.trim() : '';
    if (!name || name === 'Unable to load product') return null;
    return {
      id: null,
      name: name,
      price: doc.getElementById('product-price')
        ? doc.getElementById('product-price').textContent.trim()
        : null,
      image: imgEl ? imgEl.getAttribute('src') : '',
    };
  }

  function resolveSelectedProductName() {
    try {
      var id = localStorage.getItem('selectedProductId');
      if (id) return id;
      var legacy = JSON.parse(localStorage.getItem('selectedProduct') || '{}');
      return legacy.name || null;
    } catch (e) {
      return null;
    }
  }

  async function fetchProductByName(name) {
    try {
      var res = await root.fetch('/api/products');
      if (res && res.ok) {
        var list = await res.json();
        var match = list.filter(function (p) {
          return p.name === name;
        })[0];
        if (match) {
          return {
            id: match.id,
            name: match.name,
            price: match.price,
            image: match.img,
          };
        }
      }
    } catch (e) {
      /* backend unavailable, caller will fall back to static data */
    }
    return null;
  }

  async function initSingleProductPage() {
    var name = resolveSelectedProductName();
    var current = null;

    if (name) {
      current = await fetchProductByName(name);
      if (!current) current = getStaticProductByName(name);
    }

    // Backend/static lookups can miss (e.g. name mismatch); fall back to
    // whatever ended up rendered on the page after app.js ran.
    if (!current) {
      for (var attempt = 0; attempt < 5 && !current; attempt++) {
        current = readCurrentProductFromDom(document);
        if (!current) {
          await new Promise(function (resolve) {
            root.setTimeout(resolve, 150);
          });
        }
      }
    }

    if (current) {
      addRecentlyViewed(current);
    }

    renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
      excludeId: current && current.id != null ? current.id : undefined,
      excludeName: current && current.id == null ? current.name : undefined,
    });
  }

  function initShopPage() {
    renderRecentlyViewed({
      containerId: 'recently-viewed-container',
      sectionId: 'recently-viewed-section',
    });
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!document.getElementById('recently-viewed-container')) return;

      if (root.location.pathname.indexOf('singleProduct') !== -1) {
        initSingleProductPage();
      } else {
        initShopPage();
      }
    });
  }

  root.RecentlyViewed = {
    STORAGE_KEY: STORAGE_KEY,
    MAX_ITEMS: MAX_ITEMS,
    getRecentlyViewed: getRecentlyViewed,
    addRecentlyViewed: addRecentlyViewed,
    renderRecentlyViewed: renderRecentlyViewed,
  };
})(typeof window !== 'undefined' ? window : globalThis);
