/**
 * Infinite Scroll for Shop Page
 * Loads more product cards as the user scrolls near the bottom,
 * with a loading spinner and "end of results" indicator.
 */
(function () {
  'use strict';

  var ITEMS_PER_PAGE = 8;
  var SCROLL_THRESHOLD = 200;
  var STORAGE_KEY = 'cara_shop_products';
  var currentPage = 1;
  var loading = false;
  var allLoaded = false;

  function getProducts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function createSentinel() {
    if (document.getElementById('infiniteScrollSentinel')) return;
    var el = document.createElement('div');
    el.id = 'infiniteScrollSentinel';
    el.className = 'infinite-scroll-sentinel';
    el.innerHTML =
      '<div class="infinite-spinner"></div>' +
      '<span class="infinite-text">Loading more products...</span>';
    document.body.appendChild(el);
  }

  function createEndMarker() {
    var el = document.createElement('div');
    el.className = 'infinite-scroll-end';
    el.innerHTML = '<span>You\'ve seen all products</span> <a href="shop.html">Back to top</a>';
    return el;
  }

  function loadMore() {
    if (loading || allLoaded) return;
    loading = true;

    var sentinel = document.getElementById('infiniteScrollSentinel');
    if (sentinel) sentinel.style.display = 'flex';

    var shopContainer = document.getElementById('shop-container');
    if (!shopContainer) {
      loading = false;
      return;
    }

    var products = getProducts();
    var start = currentPage * ITEMS_PER_PAGE;
    var batch = products.slice(start, start + ITEMS_PER_PAGE);

    if (batch.length === 0) {
      allLoaded = true;
      if (sentinel) sentinel.style.display = 'none';
      var endMarker = createEndMarker();
      shopContainer.parentNode.insertBefore(endMarker, sentinel);
      loading = false;
      return;
    }

    setTimeout(function () {
      batch.forEach(function (product) {
        var card = document.createElement('div');
        card.className = 'pro';
        card.dataset.productId = product.id || '';
        card.innerHTML =
          '<img src="' + (product.image || 'images/products/f1.jpg') + '" alt="' + (product.name || 'Product') + '" />' +
          '<div class="des">' +
          '<span>' + (product.brand || 'Cara') + '</span>' +
          '<h5>' + (product.name || 'Product') + '</h5>' +
          '<div class="star">' +
          '<i class="fa fa-star"></i>'.repeat(Math.floor(product.rating || 4)) +
          '</div>' +
          '<h4>' + (product.price || '$0.00') + '</h4>' +
          '</div>' +
          '<a href="#"><i class="fa fa-shopping-cart cart"></i></a>';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        shopContainer.appendChild(card);
        requestAnimationFrame(function () {
          card.style.transition = 'opacity .4s, transform .4s';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });

      currentPage++;
      loading = false;
      if (sentinel) sentinel.style.display = 'none';
    }, 600);
  }

  function injectStyles() {
    if (document.getElementById('infiniteStyles')) return;
    var s = document.createElement('style');
    s.id = 'infiniteStyles';
    s.textContent =
      '.infinite-scroll-sentinel{display:none;align-items:center;justify-content:center;gap:10px;padding:30px;color:#64748b}' +
      '.infinite-spinner{width:24px;height:24px;border:3px solid #e2e8f0;border-top-color:#088178;border-radius:50%;animation:spin .8s linear infinite}' +
      '@keyframes spin{to{transform:rotate(360deg)}}' +
      '.infinite-scroll-end{text-align:center;padding:30px;color:#94a3b8;font-size:14px}' +
      '.infinite-scroll-end a{color:#088178;text-decoration:underline}';
    document.head.appendChild(s);
  }

  function init() {
    var shopContainer = document.getElementById('shop-container');
    if (!shopContainer) return;

    injectStyles();
    createSentinel();

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) loadMore();
        });
      },
      { rootMargin: SCROLL_THRESHOLD + 'px' }
    );

    var sentinel = document.getElementById('infiniteScrollSentinel');
    if (sentinel) observer.observe(sentinel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraInfiniteScroll = { loadMore: loadMore };
})();
