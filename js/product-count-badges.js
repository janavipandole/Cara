/**
 * Product Count Badge System
 * Displays dynamic count badges on navigation links (Cart, Wishlist)
 * that update in real-time as items are added/removed.
 */
(function () {
  'use strict';

  var BADGES = {};

  function createBadge(element, count) {
    if (!element) return null;
    var existing = element.querySelector('.count-badge');
    if (existing) {
      existing.textContent = String(count);
      existing.style.display = count > 0 ? 'inline-flex' : 'none';
      return existing;
    }

    var badge = document.createElement('span');
    badge.className = 'count-badge';
    badge.textContent = String(count);
    badge.setAttribute('aria-label', count + ' items');
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
    element.style.position = 'relative';
    element.appendChild(badge);
    return badge;
  }

  function getCartCount() {
    try {
      var cart = JSON.parse(localStorage.getItem('cara_cart') || '[]');
      return cart.reduce(function (sum, item) {
        return sum + (item.qty || item.quantity || 1);
      }, 0);
    } catch (e) {
      return 0;
    }
  }

  function getWishlistCount() {
    try {
      var wl = JSON.parse(localStorage.getItem('cara_wishlist') || '[]');
      return Array.isArray(wl) ? wl.length : 0;
    } catch (e) {
      return 0;
    }
  }

  function updateAllBadges() {
    var cartLinks = document.querySelectorAll('a[href*="cart.html"], [data-badge="cart"]');
    cartLinks.forEach(function (el) {
      createBadge(el, getCartCount());
    });

    var wlLinks = document.querySelectorAll('a[href*="wishlist.html"], [data-badge="wishlist"]');
    wlLinks.forEach(function (el) {
      createBadge(el, getWishlistCount());
    });
  }

  function injectStyles() {
    if (document.getElementById('badgeStyles')) return;
    var s = document.createElement('style');
    s.id = 'badgeStyles';
    s.textContent =
      '.count-badge{position:absolute;top:-6px;right:-8px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;padding:0 5px;line-height:1;pointer-events:none;animation:badge-pop .3s ease}' +
      '@keyframes badge-pop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    updateAllBadges();

    window.addEventListener('storage', function (e) {
      if (e.key === 'cara_cart' || e.key === 'cara_wishlist') {
        updateAllBadges();
      }
    });

    var origSetItem = localStorage.setItem;
    localStorage.setItem = function () {
      origSetItem.apply(this, arguments);
      if (arguments[0] === 'cara_cart' || arguments[0] === 'cara_wishlist') {
        setTimeout(updateAllBadges, 0);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraBadges = { update: updateAllBadges };
})();
