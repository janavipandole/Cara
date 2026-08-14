(function () {
  'use strict';
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const search = document.querySelector('[data-global-search]');
      if (search) { search.focus(); search.select(); }
    }
    if (e.key === 'Escape') {
      document.dispatchEvent(new CustomEvent('cara:close-overlays'));
    }
  });
})();
