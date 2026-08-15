(function () {
  'use strict';
  const el = document.querySelector('[data-save-later-count]');
  if (!el) return;
  const render = (count) => { el.textContent = String(count || 0); };
  render(el.getAttribute('data-save-later-count') || '0');
  window.addEventListener('cara:save-later-updated', (e) => render(e.detail && e.detail.count));
})();
