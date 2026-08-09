/**
 * Algorithmic Predictive Search (#6295)
 *
 * Search-as-you-type for the navbar #searchBar. While the user types, the
 * module queries GET /api/products/search/predictive (which ranks matches
 * algorithmically by name/brand match quality then rating) and renders a
 * rich dropdown of up to 3 product cards with thumbnail, price, star rating
 * and a one-click Add to Cart.
 *
 * Self-contained: it wires whatever #searchBar exists when it loads and uses a
 * MutationObserver to pick up navbars injected later by navbar.js/loadNavbar.
 */

(function () {
  'use strict';

  const API_BASE_URL = window.CARA_API_BASE_URL || '';
  const SUGGESTION_LIMIT = 3;
  const DEBOUNCE_MS = 220;
  const MIN_QUERY_LENGTH = 2;

  let panel = null;
  let activeRequest = null;
  let debouncedSearch = null;
  let observer = null;

  const CSS = `
    .predictive-search-panel {
      position: fixed;
      z-index: 2147483000;
      background: var(--card-bg, #ffffff);
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
      overflow: hidden;
      display: none;
      font-family: inherit;
      max-height: 80vh;
      overflow-y: auto;
    }
    .predictive-search-panel.visible { display: block; }
    .predictive-search-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      cursor: pointer;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
    .predictive-search-card:hover,
    .predictive-search-card.active {
      background: rgba(8, 129, 120, 0.08);
    }
    .predictive-search-thumb {
      width: 52px;
      height: 64px;
      object-fit: cover;
      border-radius: 8px;
      background: #f3f3f3;
      flex: 0 0 auto;
    }
    .predictive-search-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .predictive-search-name {
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .predictive-search-brand {
      font-size: 12px;
      opacity: 0.65;
    }
    .predictive-search-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .predictive-search-stars { color: #f5a623; font-size: 12px; }
    .predictive-search-price { font-weight: 700; font-size: 14px; }
    .predictive-search-add {
      border: none;
      background: var(--brand, #088178);
      color: #fff;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      flex: 0 0 auto;
    }
    .predictive-search-add:hover { filter: brightness(1.1); }
  `;

  function injectStyles() {
    if (document.getElementById('predictive-search-styles')) return;
    const style = document.createElement('style');
    style.id = 'predictive-search-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  }

  function stars(rating) {
    const r = Math.max(0, Math.min(5, Math.round(Number(rating)) || 0));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function createPanel() {
    panel = document.createElement('div');
    panel.className = 'predictive-search-panel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'Search suggestions');
    panel.addEventListener('click', onPanelClick);
    document.body.appendChild(panel);
    return panel;
  }

  function positionPanel(input) {
    if (!panel) return;
    const rect = input.getBoundingClientRect();
    panel.style.top = rect.bottom + 6 + 'px';
    panel.style.left = rect.left + 'px';
    panel.style.width = Math.max(rect.width, 280) + 'px';
  }

  function renderPanel(data, input) {
    const suggestions =
      data && Array.isArray(data.suggestions) ? data.suggestions : [];
    if (!suggestions.length) {
      closePanel();
      return;
    }
    if (!panel) createPanel();

    let html = '';
    for (const p of suggestions) {
      const price = Number(p.price) || 0;
      const safeName = escapeHtml(p.name);
      html +=
        `<div class="predictive-search-card" role="option" data-id="${escapeHtml(p.id)}" data-name="${safeName}">` +
        `<img class="predictive-search-thumb" src="${escapeHtml(p.img)}" alt="${safeName}" loading="lazy" onerror="this.style.visibility='hidden'">` +
        `<div class="predictive-search-info">` +
        `<span class="predictive-search-name">${safeName}</span>` +
        `<span class="predictive-search-brand">${escapeHtml(p.brand || '')}</span>` +
        `<span class="predictive-search-meta">` +
        `<span class="predictive-search-stars" aria-label="${escapeHtml(p.rating)} out of 5 stars">${stars(p.rating)}</span>` +
        `<span class="predictive-search-price">₹${price.toLocaleString('en-IN')}</span>` +
        `</span></div>` +
        `<button class="predictive-search-add" type="button" data-id="${escapeHtml(p.id)}" data-name="${safeName}" data-price="${price}" data-img="${escapeHtml(p.img)}" aria-label="Add ${safeName} to cart">Add</button>` +
        `</div>`;
    }
    panel.innerHTML = html;
    positionPanel(input);
    panel.classList.add('visible');
  }

  function closePanel() {
    if (panel) {
      panel.classList.remove('visible');
      panel.innerHTML = '';
    }
    if (activeRequest) {
      activeRequest.abort();
      activeRequest = null;
    }
  }

  function addToCartFromSuggestion(item) {
    const productId =
      item.id != null && item.id !== '' ? Number(item.id) : undefined;
    if (typeof window.addToCart === 'function') {
      window.addToCart(
        item.name,
        Number(item.price),
        item.img,
        1,
        'Standard',
        productId,
      );
    } else {
      try {
        const cart = JSON.parse(localStorage.getItem('productsInCart')) || [];
        cart.push({
          id: productId,
          name: item.name,
          price: Number(item.price),
          image: item.img,
          img: item.img,
          quantity: 1,
          size: 'Standard',
        });
        localStorage.setItem('productsInCart', JSON.stringify(cart));
      } catch {
        // Storage unavailable — swallow; the global addToCart path is the norm.
      }
    }
    closePanel();
  }

  function onPanelClick(event) {
    const addBtn = event.target.closest('.predictive-search-add');
    if (addBtn) {
      event.preventDefault();
      event.stopPropagation();
      addToCartFromSuggestion({
        id: addBtn.dataset.id,
        name: addBtn.dataset.name,
        price: addBtn.dataset.price,
        img: addBtn.dataset.img,
      });
      return;
    }
    const card = event.target.closest('.predictive-search-card');
    if (card) {
      event.preventDefault();
      openProduct(card.dataset.id, card.dataset.name);
    }
  }

  function openProduct(id, name) {
    try {
      const selected = {
        id: Number(id),
        name,
        price: '',
        brand: '',
        image: '',
      };
      const card =
        panel &&
        panel.querySelector('.predictive-search-card[data-id="' + id + '"]');
      if (card) {
        const priceText = card.querySelector('.predictive-search-price');
        const brandText = card.querySelector('.predictive-search-brand');
        const imgEl = card.querySelector('.predictive-search-thumb');
        if (priceText) selected.price = priceText.textContent;
        if (brandText) selected.brand = brandText.textContent;
        if (imgEl) selected.image = imgEl.src;
      }
      localStorage.setItem('selectedProduct', JSON.stringify(selected));
    } catch {
      // Ignore storage failures.
    }
    window.location.href = 'singleProduct.html';
  }

  async function fetchSuggestions(query) {
    if (activeRequest) activeRequest.abort();
    activeRequest = new AbortController();
    const url =
      API_BASE_URL +
      '/api/products/search/predictive?q=' +
      encodeURIComponent(query) +
      '&limit=' +
      SUGGESTION_LIMIT;
    const res = await fetch(url, {
      credentials: 'include',
      signal: activeRequest.signal,
    });
    if (!res.ok) throw new Error('Predictive search failed: ' + res.status);
    return res.json();
  }

  async function onInput(event) {
    const input = event.target;
    const query = input.value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      closePanel();
      return;
    }
    try {
      const data = await fetchSuggestions(query);
      if (input.value.trim() !== query) return; // stale response — input changed
      renderPanel(data, input);
    } catch (err) {
      if (!(err && err.name === 'AbortError')) closePanel();
    }
  }

  function highlightNext(input, delta) {
    if (!panel || !panel.classList.contains('visible')) return;
    const items = panel.querySelectorAll('.predictive-search-card');
    if (!items.length) return;
    const current = panel.querySelector('.predictive-search-card.active');
    let index = current ? Array.prototype.indexOf.call(items, current) : -1;
    index = (index + delta + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle('active', i === index));
    items[index].scrollIntoView({ block: 'nearest' });
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      closePanel();
      return;
    }
    if (!panel || !panel.classList.contains('visible')) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlightNext(event.target, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlightNext(event.target, -1);
    } else if (event.key === 'Enter') {
      const active = panel.querySelector('.predictive-search-card.active');
      const first = panel.querySelector('.predictive-search-card');
      const target = active || first;
      if (target) {
        event.preventDefault();
        target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    }
  }

  function onDocumentClick(event) {
    if (panel && panel.classList.contains('visible')) {
      if (
        event.target.closest &&
        !event.target.closest('#searchBar') &&
        !event.target.closest('.predictive-search-panel')
      ) {
        closePanel();
      }
    }
  }

  function onReposition() {
    const input = document.getElementById('searchBar');
    if (input && panel && panel.classList.contains('visible'))
      positionPanel(input);
  }

  function wireSearchBar() {
    const input = document.getElementById('searchBar');
    if (!input || input.dataset.predictiveWired) return;
    input.dataset.predictiveWired = '1';

    debouncedSearch = debounce(onInput, DEBOUNCE_MS);
    input.addEventListener('input', debouncedSearch);
    input.addEventListener('keydown', onKeyDown);
    input.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement !== input) closePanel();
      }, 150);
    });
    input.addEventListener('focus', () => {
      if (input.value.trim().length >= MIN_QUERY_LENGTH)
        debouncedSearch({ target: input });
    });
  }

  function init() {
    injectStyles();
    wireSearchBar();

    if (typeof MutationObserver !== 'undefined' && !observer) {
      observer = new MutationObserver(() => {
        if (!document.getElementById('searchBar')) return;
        wireSearchBar();
        observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('click', onDocumentClick);
    window.addEventListener('scroll', onReposition, { passive: true });
    window.addEventListener('resize', onReposition);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
