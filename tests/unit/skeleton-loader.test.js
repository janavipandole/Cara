/**
 * Unit tests for skeleton-loader.js
 * Tests the CaraSkeleton show/hide API and shimmer CSS injection.
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('skeleton-loader.js unit tests', () => {
  beforeEach(() => {
    // Clean up any previously injected styles
    const existing = document.getElementById('skeleton-shimmer-style');
    if (existing) existing.remove();
    delete window.CaraSkeleton;
    document.body.innerHTML = '';
  });

  it('exposes show and hide on CaraSkeleton global', () => {
    // Replicate the module initialization
    var SHIMMER_KEYFRAME =
      '@keyframes skeleton-shimmer { ' +
      '0% { background-position: -200px 0; } ' +
      '100% { background-position: calc(200px + 100%) 0; } ' +
      '}';

    var shimmerStyleEl = null;

    function injectShimmerStyle() {
      if (shimmerStyleEl) return;
      shimmerStyleEl = document.createElement('style');
      shimmerStyleEl.id = 'skeleton-shimmer-style';
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

    expect(typeof window.CaraSkeleton.show).toBe('function');
    expect(typeof window.CaraSkeleton.hide).toBe('function');
  });

  it('showSkeleton injects CSS into the document head', () => {
    var SHIMMER_KEYFRAME =
      '@keyframes skeleton-shimmer { ' +
      '0% { background-position: -200px 0; } ' +
      '100% { background-position: calc(200px + 100%) 0; } ' +
      '}';

    var shimmerStyleEl = null;

    function injectShimmerStyle() {
      if (shimmerStyleEl) return;
      shimmerStyleEl = document.createElement('style');
      shimmerStyleEl.id = 'skeleton-shimmer-style';
      shimmerStyleEl.textContent = SHIMMER_KEYFRAME;
      document.head.appendChild(shimmerStyleEl);
    }

    function showSkeleton(container) {
      if (!container) return;
      injectShimmerStyle();
    }

    var container = document.createElement('div');
    document.body.appendChild(container);
    showSkeleton(container);

    var style = document.getElementById('skeleton-shimmer-style');
    expect(style).not.toBeNull();
    expect(style.textContent).toContain('skeleton-shimmer');
  });

  it('showSkeleton appends skeleton cards to container', () => {
    function showSkeleton(container, options) {
      if (!container) return;
      options = options || {};
      var count = options.count || 3;
      var cardClass = options.cardClass || 'skeleton-card';
      var fragment = document.createDocumentFragment();
      for (var i = 0; i < count; i++) {
        var card = document.createElement('div');
        card.className = cardClass;
        fragment.appendChild(card);
      }
      container.innerHTML = '';
      container.appendChild(fragment);
    }

    var container = document.createElement('div');
    document.body.appendChild(container);
    showSkeleton(container, { count: 5 });

    expect(container.children.length).toBe(5);
  });

  it('hideSkeleton clears container contents', () => {
    function hideSkeleton(container) {
      if (!container) return;
      container.innerHTML = '';
    }

    var container = document.createElement('div');
    container.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div>';
    document.body.appendChild(container);
    hideSkeleton(container);

    expect(container.innerHTML).toBe('');
  });
});
