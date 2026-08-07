/**
 * Quick View Product Modal
 * Opens a lightweight modal showing product details, image, price, and add-to-cart
 * without navigating away from the current page.
 */
(function () {
  'use strict';

  function createQuickViewModal() {
    if (document.getElementById('quickViewModal')) return;

    var overlay = document.createElement('div');
    overlay.id = 'quickViewModal';
    overlay.className = 'qv-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Quick View Product');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML =
      '<div class="qv-modal">' +
      '<button class="qv-close" aria-label="Close quick view">&times;</button>' +
      '<div class="qv-body">' +
      '<div class="qv-image-wrap"><img class="qv-image" src="" alt="" /></div>' +
      '<div class="qv-details">' +
      '<span class="qv-brand"></span>' +
      '<h2 class="qv-name"></h2>' +
      '<div class="qv-rating"></div>' +
      '<p class="qv-price"></p>' +
      '<p class="qv-description"></p>' +
      '<div class="qv-colors"></div>' +
      '<div class="qv-actions">' +
      '<button class="qv-add-cart">Add to Cart</button>' +
      '<a class="qv-view-full" href="#">View Full Details</a>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.qv-close').addEventListener('click', closeQuickView);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeQuickView();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeQuickView();
    });
  }

  function renderStars(rating) {
    var r = parseFloat(rating) || 0;
    var full = Math.floor(r);
    var half = r % 1 >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    return (
      '<span class="qv-stars">' +
      '<i class="fa fa-star"></i>'.repeat(full) +
      (half ? '<i class="fa fa-star-half-o"></i>' : '') +
      '<i class="fa fa-star-o"></i>'.repeat(empty) +
      '</span> <span class="qv-rating-num">(' + r.toFixed(1) + ')</span>'
    );
  }

  function openQuickView(product) {
    if (!product) return;
    createQuickViewModal();

    var modal = document.getElementById('quickViewModal');
    modal.querySelector('.qv-image').src = product.image || 'images/products/f1.jpg';
    modal.querySelector('.qv-image').alt = product.name || 'Product';
    modal.querySelector('.qv-brand').textContent = product.brand || '';
    modal.querySelector('.qv-name').textContent = product.name || 'Product';
    modal.querySelector('.qv-rating').innerHTML = renderStars(product.rating);
    modal.querySelector('.qv-price').textContent = product.price || '';
    modal.querySelector('.qv-description').textContent =
      product.description || 'High-quality product from Cara. Made with premium materials for lasting comfort and style.';
    modal.querySelector('.qv-view-full').href =
      product.url || "javascript:void(0)";

    var colorsEl = modal.querySelector('.qv-colors');
    var colors = product.colors || ['#088178', '#1a1a2e', '#e2e8f0', '#d4a574'];
    colorsEl.innerHTML =
      '<span class="qv-colors-label">Colors:</span>' +
      colors
        .map(function (c) {
          return (
            '<button class="qv-color-swatch" style="background:' +
            c +
            '" aria-label="Color option"></button>'
          );
        })
        .join('');

    modal.querySelector('.qv-add-cart').onclick = function () {
      if (typeof window.addToCart === 'function') {
        window.addToCart(product);
      } else {
        try {
          var cart = JSON.parse(localStorage.getItem('cara_cart') || '[]');
          cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
          localStorage.setItem('cara_cart', JSON.stringify(cart));
        } catch (e) { /* ignore */ }
      }
      closeQuickView();
      if (typeof showToast === 'function') {
        showToast('Added to cart!', 'success');
      }
    };

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.qv-close').focus();
  }

  function closeQuickView() {
    var modal = document.getElementById('quickViewModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function injectStyles() {
    if (document.getElementById('qvStyles')) return;
    var s = document.createElement('style');
    s.id = 'qvStyles';
    s.textContent =
      '.qv-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity .25s}' +
      '.qv-overlay.open{display:flex;opacity:1}' +
      '.qv-modal{background:#fff;border-radius:12px;width:92%;max-width:720px;max-height:85vh;overflow:auto;position:relative;box-shadow:0 25px 80px rgba(0,0,0,.25)}' +
      '.qv-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:28px;cursor:pointer;color:#64748b;z-index:2;line-height:1}' +
      '.qv-close:hover{color:#0f172a}' +
      '.qv-body{display:flex;gap:24px;padding:28px;flex-wrap:wrap}' +
      '.qv-image-wrap{flex:1 1 280px;min-width:240px}' +
      '.qv-image{width:100%;border-radius:8px;object-fit:cover;max-height:320px}' +
      '.qv-details{flex:1 1 260px}' +
      '.qv-brand{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#088178;font-weight:600}' +
      '.qv-name{margin:6px 0 8px;font-size:22px;color:#0f172a}' +
      '.qv-rating{margin-bottom:10px}' +
      '.qv-stars{color:#f59e0b;font-size:14px}' +
      '.qv-rating-num{color:#64748b;font-size:13px}' +
      '.qv-price{font-size:24px;font-weight:700;color:#088178;margin:8px 0}' +
      '.qv-description{font-size:14px;color:#475569;line-height:1.6;margin-bottom:16px}' +
      '.qv-colors{display:flex;align-items:center;gap:8px;margin-bottom:20px}' +
      '.qv-colors-label{font-size:13px;color:#64748b}' +
      '.qv-color-swatch{width:28px;height:28px;border-radius:50%;border:2px solid #e2e8f0;cursor:pointer;transition:transform .15s}' +
      '.qv-color-swatch:hover{transform:scale(1.15)}' +
      '.qv-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}' +
      '.qv-add-cart{padding:12px 28px;background:#088178;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .2s}' +
      '.qv-add-cart:hover{background:#066e68}' +
      '.qv-view-full{font-size:13px;color:#088178;text-decoration:underline}';
    document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    document.querySelectorAll('[data-quick-view]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var card = this.closest('.pro, [data-product]');
        var product = {
          id: this.dataset.productId || Math.random().toString(36).substr(2, 8),
          name: this.dataset.productName || (card && card.querySelector('h5, .name'))?.textContent?.trim() || 'Product',
          price: this.dataset.productPrice || (card && card.querySelector('h4, .price'))?.textContent?.trim() || '',
          image: this.dataset.productImage || (card && card.querySelector('img'))?.src || '',
          brand: this.dataset.productBrand || '',
          rating: this.dataset.productRating || '4.5',
          colors: this.dataset.productColors ? this.dataset.productColors.split(',') : undefined,
          url: this.dataset.productUrl || '#',
        };
        openQuickView(product);
      });
    });
  });

  window.CaraQuickView = { open: openQuickView, close: closeQuickView };
})();
