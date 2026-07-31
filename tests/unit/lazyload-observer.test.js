import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initLazyLoadObserver } from '../../js/lazyload-observer.js';

describe('IntersectionObserver Lazy Load Unit Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should fallback to immediate image source replacement if IntersectionObserver is unsupported', () => {
    const originalObserver = window.IntersectionObserver;
    delete window.IntersectionObserver;

    const img = document.createElement('img');
    img.className = 'lazyload';
    img.dataset.src = 'img/products/f1.jpg';
    document.body.appendChild(img);

    initLazyLoadObserver('img.lazyload');

    expect(img.src).toContain('img/products/f1.jpg');
    expect(img.classList.contains('lazyloaded')).toBe(true);

    window.IntersectionObserver = originalObserver;
  });

  it('should observe image elements when IntersectionObserver is supported', () => {
    const observeMock = vi.fn();
    class MockIntersectionObserver {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
      }
      observe(target) {
        observeMock(target);
      }
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver;

    const img1 = document.createElement('img');
    img1.className = 'lazyload';
    img1.dataset.src = 'img/products/f1.jpg';

    const img2 = document.createElement('img');
    img2.className = 'lazyload';
    img2.dataset.src = 'img/products/f2.jpg';

    document.body.appendChild(img1);
    document.body.appendChild(img2);

    initLazyLoadObserver('img.lazyload');
    expect(observeMock).toHaveBeenCalledTimes(2);
  });
});
