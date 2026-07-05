/* global showToast */
// compare-dock.js
// Handles the floating comparison dock and adding/removing products from comparison.

(function () {
  'use strict';

  const STORAGE_KEY = 'cara_compare_list';
  const MAX_COMPARE_ITEMS = 3;

  function getCompareList() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCompareList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Dispatch a custom event to notify compare.js or other listeners
    window.dispatchEvent(
      new CustomEvent('compareListUpdated', { detail: list })
    );
  }

  function renderCompareDock() {
    let dock = document.getElementById('compare-dock');
    const list = getCompareList();

    if (list.length === 0) {
      if (dock) dock.remove();
      return;
    }

    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'compare-dock';
      dock.className = 'compare-dock';
      dock.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: var(--card-bg, #ffffff);
        box-shadow: 0 -10px 30px rgba(0,0,0,0.15);
        border-top: 2px solid var(--accent, #088178);
        padding: 15px 24px;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        box-sizing: border-box;
        transition: transform 0.3s ease;
        transform: translateY(0);
      `;
      document.body.appendChild(dock);
    }

    // Load products database if available to get images
    const allProducts = window.products || [];

    const itemsHTML = list
      .map((name) => {
        const prod = allProducts.find((p) => p.name === name) || {};
        const imgUrl = prod.img || 'images/products/placeholder.jpg';
        return `
          <div class="compare-dock-item" style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.03); padding:6px 12px; border-radius:30px; border:1px solid var(--border-color, #eee);">
            <img src="${imgUrl}" alt="${name}" style="width:36px; height:36px; object-fit:cover; border-radius:50%; border:1px solid #ccc;">
            <span style="font-size:12px; font-weight:600; max-width:120px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-primary);">${name}</span>
            <button class="remove-compare-dock-btn" data-product-name="${name}" style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:14px; padding:0 4px;">×</button>
          </div>
        `;
      })
      .join('');

    dock.innerHTML = `
      <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
        <span style="font-size:14px; font-weight:700; color:var(--accent, #088178); display:flex; align-items:center; gap:6px;">
          <i class="ri-arrow-left-right-line"></i> Compare Products (${list.length}/${MAX_COMPARE_ITEMS})
        </span>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${itemsHTML}
        </div>
      </div>
      <div style="display:flex; gap:12px; align-items:center;">
        <button id="compare-now-btn" style="background:var(--accent, #088178); color:#fff; border:none; padding:10px 20px; border-radius:20px; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px;">Compare Now</button>
        <button id="clear-compare-btn" style="background:none; border:1px solid #ccc; color:var(--text-secondary, #666); padding:9px 18px; border-radius:20px; font-weight:600; font-size:13px; cursor:pointer;">Clear All</button>
      </div>
    `;

    // Add remove listeners
    dock.querySelectorAll('.remove-compare-dock-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = btn.dataset.productName;
        toggleCompareItem(name);
      });
    });

    // Add now/clear listeners
    document
      .getElementById('compare-now-btn')
      ?.addEventListener('click', () => {
        window.location.href = 'compare.html';
      });
    document
      .getElementById('clear-compare-btn')
      ?.addEventListener('click', () => {
        saveCompareList([]);
        updateAllCompareButtons();
        renderCompareDock();
      });
  }

  function toggleCompareItem(name) {
    const list = getCompareList();
    const idx = list.indexOf(name);

    if (idx > -1) {
      list.splice(idx, 1);
      if (typeof showToast === 'function') {
        showToast(`${name} removed from comparison`, 'info');
      }
    } else {
      if (list.length >= MAX_COMPARE_ITEMS) {
        if (typeof showToast === 'function') {
          showToast(
            `You can compare up to ${MAX_COMPARE_ITEMS} products!`,
            'warning'
          );
        }
        return;
      }
      list.push(name);
      if (typeof showToast === 'function') {
        showToast(`${name} added to comparison`, 'success');
      }
    }

    saveCompareList(list);
    updateAllCompareButtons();
    renderCompareDock();
  }

  function updateAllCompareButtons() {
    const list = getCompareList();
    document.querySelectorAll('.compare-card-btn').forEach((btn) => {
      const name = btn.dataset.productName;
      if (!name) return;

      const isSinglePageBtn = btn.id === 'single-product-compare';

      if (list.includes(name)) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        if (isSinglePageBtn) {
          btn.innerHTML =
            '<i class="ri-checkbox-circle-fill"></i> <span>Compared</span>';
        } else {
          btn.innerHTML = '<i class="ri-checkbox-circle-fill"></i>';
        }
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
        if (isSinglePageBtn) {
          btn.innerHTML =
            '<i class="ri-arrow-left-right-line"></i> <span>Compare</span>';
        } else {
          btn.innerHTML = '<i class="ri-arrow-left-right-line"></i>';
        }
      }
    });
  }

  // Expose to window
  window.toggleCompareItem = toggleCompareItem;
  window.getCompareList = getCompareList;
  window.updateAllCompareButtons = updateAllCompareButtons;
  window.renderCompareDock = renderCompareDock;

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Add custom styling for the compare card buttons
    const style = document.createElement('style');
    style.textContent = `
      .compare-card-btn {
        position: absolute;
        top: 64px;
        right: 12px;
        width: 44px;
        height: 44px;
        background: var(--card-bg, #ffffff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        z-index: 20;
        border: 1px solid var(--border-color, #eee);
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .compare-card-btn i {
        font-size: 20px;
        color: var(--text-secondary, #666);
        transition: transform 0.2s ease, color 0.2s ease;
      }
      .compare-card-btn.active i {
        color: var(--accent, #088178);
      }
      .compare-card-btn:hover i {
        transform: scale(1.15);
        color: var(--accent, #088178);
      }
      .compare-card-btn:focus-visible {
        outline: 3px solid rgba(8, 129, 120, 0.28);
        outline-offset: 3px;
      }
    `;
    document.head.appendChild(style);

    const singleBtn = document.getElementById('single-product-compare');
    if (singleBtn) {
      const nameEl = document.getElementById('product-name');
      if (nameEl) {
        singleBtn.dataset.productName = nameEl.textContent.trim();
      }
      singleBtn.addEventListener('click', () => {
        const name = singleBtn.dataset.productName || 'Product';
        toggleCompareItem(name);
      });
    }

    setTimeout(() => {
      updateAllCompareButtons();
      renderCompareDock();
    }, 300);
  });
})();
