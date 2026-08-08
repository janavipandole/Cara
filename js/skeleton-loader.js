// Skeleton loading placeholder system for product cards and content sections
// Provides animated shimmer placeholders while content is loading

(function () {
  'use strict';

  var SHIMMER_KEYFRAME =
    '@keyframes skeleton-shimmer { ' +
    '0% { background-position: -200px 0; } ' +
    '100% { background-position: calc(200px + 100%) 0; } ' +
    '}';

  var shimmerStyleEl = null;

  function injectShimmerStyle() {
    if (shimmerStyleEl) return;
    shimmerStyleEl = document.createElement('style');
    shimmerStyleEl.textContent =
      SHIMMER_KEYFRAME +
      '.skeleton-block { ' +
      '  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); ' +
      '  background-size: 200px 100%; ' +
      '  animation: skeleton-shimmer 1.4s ease-in-out infinite; ' +
      '  border-radius: 4px; ' +
      '  display: block; ' +
      '}' +
      '.skeleton-hidden { display: none !important; }';
    document.head.appendChild(shimmerStyleEl);
  }

  function createSkeletonCard(opt) {
    var width = opt.width || '100%';
    var height = opt.height || '20px';
    var el = document.createElement('div');
    el.className = 'skeleton-block';
    el.style.width = width;
    el.style.height = height;
    if (opt.margin) el.style.margin = opt.margin;
    return el;
  }

  function showSkeleton(container, options) {
    if (!container) return;
    injectShimmerStyle();
    options = options || {};

    var count = options.count || 3;
    var cardClass = options.cardClass || 'skeleton-card';

    var fragment = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var card = document.createElement('div');
      card.className = cardClass;
      card.appendChild(createSkeletonCard({ width: '100%', height: '180px' }));
      card.appendChild(
        createSkeletonCard({ width: '70%', height: '16px', margin: '8px 0' }),
      );
      card.appendChild(
        createSkeletonCard({ width: '50%', height: '14px', margin: '4px 0' }),
      );
      card.appendChild(
        createSkeletonCard({ width: '30%', height: '14px', margin: '4px 0' }),
      );
      fragment.appendChild(card);
    }

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  function hideSkeleton(container) {
    if (!container) return;
    container.innerHTML = '';
  }

  window.CaraSkeleton = {
    show: showSkeleton,
    hide: hideSkeleton,
  };
})();
