/**
 * compare.js — Product Comparison Feature
 * Issue #2576: Side-by-side product comparison table with sessionStorage (max 3 items)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'cara_compare_list';
  const MAX_ITEMS = 4;
  const engine = typeof InteractiveProductComparator !== 'undefined' ? new InteractiveProductComparator(STORAGE_KEY) : null;

  /* ============================================================
     CORE: compare list via InteractiveProductComparator
     ============================================================ */

  function getCompareList() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch (err) {
      console.warn('Failed to compare products:', err);
      return [];
    }
  }

  function saveCompareList(list) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function addToCompare(product) {
    if (!product) return false;
    const list = getCompareList();
    if (list.length >= MAX_ITEMS) {
      if (typeof showToast === 'function') {
        showToast(
          `You can compare up to ${MAX_ITEMS} products at a time.`,
          'warning',
        );
      } else {
        alert('You can compare up to ' + MAX_ITEMS + ' products at a time.');
      }
      return;
    }
    if (list.find((p) => p.id === product.id)) return false;
    list.push(product);
    saveCompareList(list);
    return true;
  }

  function removeFromCompare(id) {
    if (id == null) return;
    const list = getCompareList().filter((p) => String(p.id) !== String(id));
    saveCompareList(list);
  }

  function clearCompareList() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function isInCompare(id) {
    return getCompareList().some((p) => String(p.id) === String(id));
  }

  /* ============================================================
     SHOP PAGE: floating badge + compare checkboxes on cards
     ============================================================ */

  function updateFloatBadge() {
    const badge = document.getElementById('compareFloatBtn');
    if (!badge) return;
    const list = getCompareList();
    const count = list.length;
    const countEl = badge.querySelector('.compare-float-count');
    if (countEl) countEl.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }

  function injectCompareCheckbox(card) {
    if (!card) return;
    // Avoid duplicates
    if (card.querySelector('.compare-check-label')) return;

    // Extract product data from the card
    const nameEl = card.querySelector('h5');
    const priceEl = card.querySelector('h4');
    const brandEl =
      card.querySelector('.des span') || card.querySelector('span');
    const imgEl = card.querySelector('img');
    const idAttr =
      card.dataset.productId ||
      card.dataset.id ||
      (nameEl ? nameEl.textContent.trim() : Math.random());

    const product = {
      id: idAttr,
      name: nameEl ? nameEl.textContent.trim() : 'Product',
      price: priceEl ? priceEl.textContent.trim() : '',
      brand: brandEl ? brandEl.textContent.trim() : '',
      img: imgEl ? imgEl.src : '',
      rating: card.dataset.rating || '',
      category: card.dataset.category || '',
      color: card.dataset.color || '',
      style: card.dataset.style || '',
      availability: card.dataset.availability || 'In Stock',
    };

    const label = document.createElement('label');
    label.className = 'compare-check-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isInCompare(product.id);
    checkbox.setAttribute('aria-label', 'Compare ' + product.name);

    checkbox.addEventListener('change', function () {
      if (this.checked) {
        const added = addToCompare(product);
        if (!added) {
          this.checked = false;
        }
      } else {
        removeFromCompare(product.id);
      }
      updateFloatBadge();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' Compare'));
    card.appendChild(label);
  }

  function observeProductCards() {
    const container = document.getElementById('shop-container');
    if (!container) return;

    const process = () => {
      container.querySelectorAll('.pro').forEach(injectCompareCheckbox);
      updateFloatBadge();
    };

    process();

    const observer = new MutationObserver(process);
    observer.observe(container, { childList: true, subtree: true });
  }

  function initShopPage() {
    updateFloatBadge();
    observeProductCards();
  }

  /* ============================================================
     COMPARE PAGE: render comparison table
     ============================================================ */

  function renderStars(rating) {
    const r = parseFloat(rating) || 0;
    const full = Math.floor(r);
    const half = r % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      '<span class="stars">' +
      '★'.repeat(full) +
      (half ? '½' : '') +
      '☆'.repeat(empty) +
      '</span> <small>(' +
      r.toFixed(1) +
      ')</small>'
    );
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeImageUrl(url) {
    const str = String(url || '').trim();
    if (/^(https?:\/\/|\/|\.\/|\.\.\/|images\/)/i.test(str)) return str;
    return 'images/products/f1.jpg';
  }

  function viewProduct(p) {
    if (!p) return;
    // singleProduct.js reads a JSON object under 'selectedProduct';
    // 'selectedProductId' is kept for consumers like reviews.js.
    window.localStorage.setItem(
      'selectedProduct',
      JSON.stringify({
        id: p.id,
        name: p.name,
        price: p.price,
        brand: p.brand,
        image: p.img,
      }),
    );
    window.localStorage.setItem('selectedProductId', p.name || '');
    window.location.href = 'singleProduct.html';
  }

  function renderCompareTable(list) {
    const wrapper = document.getElementById('compareTableWrapper');
    const emptyState = document.getElementById('compareEmpty');
    if (!wrapper) return;

    if (!list || list.length === 0) {
      wrapper.style.display = 'none';
      document.querySelector('.compare-actions') &&
        (document.querySelector('.compare-actions').style.display = 'none');
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    document.querySelector('.compare-actions') &&
      (document.querySelector('.compare-actions').style.display = 'flex');
    wrapper.style.display = 'block';

    const rows = [
      { label: 'Image / Name', key: 'header' },
      { label: 'Price', key: 'price' },
      { label: 'Rating', key: 'rating' },
      { label: 'Brand', key: 'brand' },
      { label: 'Category', key: 'category' },
      { label: 'Color', key: 'color' },
      { label: 'Style', key: 'style' },
      { label: 'Availability', key: 'availability' },
      { label: 'Action', key: 'action' },
    ];

    let html =
      '<div class="compare-table-wrapper"><table class="compare-table"><tbody>';

    rows.forEach(({ label, key }) => {
      html += '<tr>';
      html += '<td class="row-label">' + label + '</td>';

      list.forEach((p, idx) => {
        if (key === 'header') {
          const safeName = escapeHtml(p.name || 'Product');
          const safeBrand = escapeHtml(p.brand || '—');
          html += '<th class="product-header">';
          html +=
            '<img src="' +
            sanitizeImageUrl(p.img) +
            '" alt="' +
            safeName +
            '" data-compare-view="' +
            idx +
            '" />';
          html += '<div class="prod-name">' + safeName + '</div>';
          html += '<div class="prod-brand">' + safeBrand + '</div>';
          html +=
            '<button class="remove-compare-btn" data-compare-remove-index="' +
            idx +
            '">✕ Remove</button>';
          html += '</th>';
        } else if (key === 'price') {
          html += '<td class="price-val">' + escapeHtml(p.price || '—') + '</td>';
        } else if (key === 'rating') {
          html += '<td>' + (p.rating ? renderStars(p.rating) : '—') + '</td>';
        } else if (key === 'action') {
          html +=
            '<td><button class="add-cart-btn" data-compare-view="' +
            idx +
            '">View Product</button></td>';
        } else if (['category', 'color', 'style'].includes(key)) {
          html +=
            '<td class="badge-cell"><span>' + escapeHtml(p[key] || '—') + '</span></td>';
        } else {
          html += '<td>' + escapeHtml(p[key] || '—') + '</td>';
        }
      });

      html += '</tr>';
    });

    html += '</tbody></table></div>';
    wrapper.innerHTML = html;
    wrapper.querySelectorAll('[data-compare-view]').forEach((el) => {
      const p = list[parseInt(el.dataset.compareView, 10)];
      if (p) el.addEventListener('click', () => viewProduct(p));
    });
    wrapper.querySelectorAll('[data-compare-remove-index]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-compare-remove-index'), 10);
        const p = list[idx];
        if (p) window.CaraCompare.remove(p.id);
      });
    });
  }

  function initComparePage() {
    const list = getCompareList();
    renderCompareTable(list);

    const clearBtn = document.getElementById('clearCompareBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        clearCompareList();
        renderCompareTable([]);
      });
    }
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.CaraCompare = {
    add: addToCompare,
    remove: function (id) {
      removeFromCompare(id);
      const list = getCompareList();
      renderCompareTable(list);
      updateFloatBadge();
      // Uncheck any checkbox with this id
      document.querySelectorAll('.compare-check-label input').forEach((cb) => {
        const card = cb.closest('.pro');
        if (card) {
          const idAttr = card.dataset.productId || card.dataset.id;
          if (String(idAttr) === String(id)) cb.checked = false;
        }
      });
    },
    clear: clearCompareList,
    getList: getCompareList,
  };

  /* ============================================================
     INIT
     ============================================================ */

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.CompareAnimationController === 'function') {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const animController = new window.CompareAnimationController();
      animController.applyMotionPreferences(
        animController.shouldDisableMotion(motionQuery.matches),
      );
      motionQuery.addEventListener('change', (e) => {
        animController.applyMotionPreferences(
          animController.shouldDisableMotion(e.matches),
        );
      });
    }

    if (document.getElementById('compareTableWrapper')) {
      initComparePage();
    } else {
      initShopPage();
    }
  });
})();
