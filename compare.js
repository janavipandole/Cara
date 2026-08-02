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

    const goToProduct = (name) => {
      window.localStorage.setItem('selectedProductId', name);
      window.location.href = 'singleProduct.html';
    };

    wrapper.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'compare-table-wrapper';
    const table = document.createElement('table');
    table.className = 'compare-table';
    const tbody = document.createElement('tbody');

    rows.forEach(({ label, key }) => {
      const tr = document.createElement('tr');

      const labelCell = document.createElement('td');
      labelCell.className = 'row-label';
      labelCell.textContent = label;
      tr.appendChild(labelCell);

      list.forEach((p) => {
        if (key === 'header') {
          const th = document.createElement('th');
          th.className = 'product-header';

          const img = document.createElement('img');
          img.src = p.img || 'images/products/f1.jpg';
          img.alt = p.name;
          img.addEventListener('click', () => goToProduct(p.name));
          th.appendChild(img);

          const nameDiv = document.createElement('div');
          nameDiv.className = 'prod-name';
          nameDiv.textContent = p.name;
          th.appendChild(nameDiv);

          const brandDiv = document.createElement('div');
          brandDiv.className = 'prod-brand';
          brandDiv.textContent = p.brand || '—';
          th.appendChild(brandDiv);

          const removeBtn = document.createElement('button');
          removeBtn.className = 'remove-compare-btn';
          removeBtn.textContent = '✕ Remove';
          removeBtn.addEventListener('click', () =>
            window.CaraCompare.remove(p.id),
          );
          th.appendChild(removeBtn);

          tr.appendChild(th);
        } else if (key === 'price') {
          const td = document.createElement('td');
          td.className = 'price-val';
          td.textContent = p.price || '—';
          tr.appendChild(td);
        } else if (key === 'rating') {
          const td = document.createElement('td');
          // renderStars() output is built from numeric values only, safe to insert.
          td.innerHTML = p.rating ? renderStars(p.rating) : '—';
          tr.appendChild(td);
        } else if (key === 'action') {
          const td = document.createElement('td');
          const btn = document.createElement('button');
          btn.className = 'add-cart-btn';
          btn.textContent = 'View Product';
          btn.addEventListener('click', () => goToProduct(p.name));
          td.appendChild(btn);
          tr.appendChild(td);
        } else if (['category', 'color', 'style'].includes(key)) {
          const td = document.createElement('td');
          td.className = 'badge-cell';
          const span = document.createElement('span');
          span.textContent = p[key] || '—';
          td.appendChild(span);
          tr.appendChild(td);
        } else {
          const td = document.createElement('td');
          td.textContent = p[key] || '—';
          tr.appendChild(td);
        }
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
    wrapper.appendChild(container);
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