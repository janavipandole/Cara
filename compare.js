/**
 * compare.js — Product Comparison Feature
 * Issue #2576: Side-by-side product comparison table with sessionStorage (max 3 items)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'cara_compare_list';
  const MAX_ITEMS = 3;

  /* ============================================================
     CORE: compare list in sessionStorage
     ============================================================ */

  function getCompareList() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCompareList(list) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function addToCompare(product) {
    const list = getCompareList();
    if (list.length >= MAX_ITEMS) {
      alert('You can compare up to ' + MAX_ITEMS + ' products at a time.');
      return false;
    }
    if (list.find((p) => p.id === product.id)) return false;
    list.push(product);
    saveCompareList(list);
    return true;
  }

  function removeFromCompare(id) {
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

      list.forEach((p) => {
        if (key === 'header') {
          html += '<th class="product-header">';
          html +=
            '<img src="' +
            (p.img || 'images/products/f1.jpg') +
            '" alt="' +
            p.name +
            "\" onclick=\"window.localStorage.setItem('selectedProductId','" +
            p.name.replace(/'/g, '') +
            "');window.location.href='singleProduct.html'\" />";
          html += '<div class="prod-name">' + p.name + '</div>';
          html += '<div class="prod-brand">' + (p.brand || '—') + '</div>';
          html +=
            '<button class="remove-compare-btn" onclick="window.CaraCompare.remove(\'' +
            p.id +
            '\')">✕ Remove</button>';
          html += '</th>';
        } else if (key === 'price') {
          html += '<td class="price-val">' + (p.price || '—') + '</td>';
        } else if (key === 'rating') {
          html += '<td>' + (p.rating ? renderStars(p.rating) : '—') + '</td>';
        } else if (key === 'action') {
          html +=
            '<td><button class="add-cart-btn" onclick="window.localStorage.setItem(\'selectedProductId\',\'' +
            p.name.replace(/'/g, '') +
            "');window.location.href='singleProduct.html'\">View Product</button></td>";
        } else if (['category', 'color', 'style'].includes(key)) {
          html +=
            '<td class="badge-cell"><span>' + (p[key] || '—') + '</span></td>';
        } else {
          html += '<td>' + (p[key] || '—') + '</td>';
        }
      });

      html += '</tr>';
    });

    html += '</tbody></table></div>';
    wrapper.innerHTML = html;
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
    if (document.getElementById('compareTableWrapper')) {
      initComparePage();
    } else {
      initShopPage();
    }
  });
})();
