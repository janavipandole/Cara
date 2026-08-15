(function () {
  'use strict';
  const grid = document.querySelector('[data-infinite-grid]');
  const sentinel = document.querySelector('[data-infinite-sentinel]');
  if (!grid || !sentinel) return;
  let loading = false;
  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || loading) return;
    loading = true;
    grid.dispatchEvent(new CustomEvent('cara:load-more', { bubbles: true }));
  }, { rootMargin: '200px' });
  observer.observe(sentinel);
  window.addEventListener('cara:load-more-complete', () => { loading = false; });
})();
