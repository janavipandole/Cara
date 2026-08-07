/**
 * Cart Sidebar Drawer
 * A slide-in cart panel that shows cart contents without leaving the current page.
 * Supports add/remove items, quantity updates, and quick checkout.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cara_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) { /* ignore */ }
  }

  function getCartTotal() {
    return getCart().reduce(function (sum, item) {
      return sum + (parseFloat(item.price) || 0) * (item.qty || 1);
    }, 0);
  }

  function createDrawer() {
    if (document.getElementById('cartDrawer')) return;

    var drawer = document.createElement('div');
    drawer.id = 'cartDrawer';
    drawer.className = 'cd-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Shopping cart');
    drawer.setAttribute('aria-hidden', 'true');

    drawer.innerHTML =
      '<div class="cd-backdrop"></div>' +
      '<div class="cd-panel">' +
      '<div class="cd-header">' +
      '<h2>Shopping Cart</h2>' +
      '<button class="cd-close" aria-label="Close cart">&times;</button>' +
      '</div>' +
      '<div class="cd-items"></div>' +
      '<div class="cd-footer">' +
      '<div class="cd-total"><span>Total</span><span class="cd-total-amount"></span></div>' +
      '<a href="checkout.html" class="cd-checkout-btn">Proceed to Checkout</a>' +
      '<button class="cd-view-cart-btn" onclick="window.location.href=\'cart.html\'">View Full Cart</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(drawer);

    drawer.querySelector('.cd-backdrop').addEventListener('click', closeDrawer);
    drawer.querySelector('.cd-close').addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  function renderItems() {
    var cart = getCart();
    var itemsEl = document.querySelector('#cartDrawer .cd-items');
    var totalEl = document.querySelector('#cartDrawer .cd-total-amount');
    if (!itemsEl) return;

    if (cart.length === 0) {
      itemsEl.innerHTML =
        '<div class="cd-empty">' +
        '<div class="cd-empty-icon">&#128722;</div>' +
        '<p>Your cart is empty</p>' +
        '<a href="shop.html" class="cd-shop-link">Start Shopping</a>' +
        '</div>';
      if (totalEl) totalEl.textContent = '$0.00';
      return;
    }

    var html = '';
    cart.forEach(function (item, idx) {
      html +=
        '<div class="cd-item" data-index="' + idx + '">' +
        '<img class="cd-item-img" src="' + (item.image || 'images/products/f1.jpg') + '" alt="' + (item.name || 'Product') + '" />' +
        '<div class="cd-item-info">' +
        '<div class="cd-item-name">' + (item.name || 'Product') + '</div>' +
        '<div class="cd-item-price">' + (item.price || '$0.00') + '</div>' +
        '<div class="cd-item-qty">' +
        '<button class="cd-qty-btn cd-qty-minus" data-idx="' + idx + '">&minus;</button>' +
        '<span class="cd-qty-val">' + (item.qty || 1) + '</span>' +
        '<button class="cd-qty-btn cd-qty-plus" data-idx="' + idx + '">+</button>' +
        '</div>' +
        '</div>' +
        '<button class="cd-item-remove" data-idx="' + idx + '" aria-label="Remove item">&times;</button>' +
        '</div>';
    });
    itemsEl.innerHTML = html;

    if (totalEl) totalEl.textContent = '$' + getCartTotal().toFixed(2);

    itemsEl.querySelectorAll('.cd-qty-minus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.dataset.idx);
        var cart = getCart();
        if (cart[idx]) {
          cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
          saveCart(cart);
          renderItems();
        }
      });
    });

    itemsEl.querySelectorAll('.cd-qty-plus').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.dataset.idx);
        var cart = getCart();
        if (cart[idx]) {
          cart[idx].qty = (cart[idx].qty || 1) + 1;
          saveCart(cart);
          renderItems();
        }
      });
    });

    itemsEl.querySelectorAll('.cd-item-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.dataset.idx);
        var cart = getCart();
        cart.splice(idx, 1);
        saveCart(cart);
        renderItems();
      });
    });
  }

  function openDrawer() {
    createDrawer();
    renderItems();
    var drawer = document.getElementById('cartDrawer');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    drawer.querySelector('.cd-close').focus();
  }

  function closeDrawer() {
    var drawer = document.getElementById('cartDrawer');
    if (!drawer) return;
    drawer.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  function injectStyles() {
    if (document.getElementById('cdStyles')) return;
    var s = document.createElement('style');
    s.id = 'cdStyles';
    s.textContent =
      '.cd-drawer{position:fixed;inset:0;z-index:10003;pointer-events:none}' +
      '.cd-drawer.open{pointer-events:auto}' +
      '.cd-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4);opacity:0;transition:opacity .3s}' +
      '.cd-drawer.open .cd-backdrop{opacity:1}' +
      '.cd-panel{position:absolute;right:0;top:0;bottom:0;width:380px;max-width:90vw;background:#fff;transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:-4px 0 20px rgba(0,0,0,.1)}' +
      '.cd-drawer.open .cd-panel{transform:translateX(0)}' +
      '.cd-header{display:flex;align-items:center;justify-content:space-between;padding:20px;border-bottom:1px solid #e5e7eb}' +
      '.cd-header h2{margin:0;font-size:18px}' +
      '.cd-close{background:none;border:none;font-size:24px;cursor:pointer;color:#64748b}' +
      '.cd-items{flex:1;overflow-y:auto;padding:16px 20px}' +
      '.cd-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9;position:relative}' +
      '.cd-item-img{width:64px;height:64px;border-radius:8px;object-fit:cover}' +
      '.cd-item-info{flex:1}' +
      '.cd-item-name{font-size:14px;font-weight:600;color:#0f172a}' +
      '.cd-item-price{font-size:14px;color:#088178;font-weight:600;margin:4px 0}' +
      '.cd-item-qty{display:flex;align-items:center;gap:8px}' +
      '.cd-qty-btn{width:24px;height:24px;border:1px solid #e2e8f0;background:#fff;border-radius:4px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}' +
      '.cd-qty-val{font-size:14px;min-width:20px;text-align:center}' +
      '.cd-item-remove{background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;align-self:flex-start}' +
      '.cd-item-remove:hover{color:#ef4444}' +
      '.cd-empty{text-align:center;padding:40px 0;color:#94a3b8}' +
      '.cd-empty-icon{font-size:48px;margin-bottom:12px}' +
      '.cd-shop-link{color:#088178;text-decoration:underline;font-size:14px}' +
      '.cd-footer{border-top:1px solid #e5e7eb;padding:20px}' +
      '.cd-total{display:flex;justify-content:space-between;font-size:16px;font-weight:700;margin-bottom:16px}' +
      '.cd-checkout-btn{display:block;width:100%;padding:14px;background:#088178;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none}' +
      '.cd-checkout-btn:hover{background:#066e68}' +
      '.cd-view-cart-btn{display:block;width:100%;padding:12px;background:none;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;cursor:pointer;margin-top:8px;text-align:center;text-decoration:none;color:#334155}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    document.querySelectorAll('[data-open-cart]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraCartDrawer = { open: openDrawer, close: closeDrawer };
})();
