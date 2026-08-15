(function () {
  'use strict';
  const el = document.querySelector('[data-wishlist-count]');
  if (!el) return;
  const KEY = 'cara_favorites';
  const render = () => {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { list = []; }
    el.textContent = String(list.length);
  };
  render();
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) render();
  });
})();
