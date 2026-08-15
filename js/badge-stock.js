(function () {
  'use strict';
  document.querySelectorAll('[data-stock-count]').forEach((el) => {
    const count = parseInt(el.getAttribute('data-stock-count'), 10);
    if (Number.isNaN(count) || count > 10) return;
    const badge = document.createElement('span');
    badge.className = 'cara-stock-badge';
    badge.textContent = count <= 3 ? 'Almost gone' : 'Low stock';
    el.appendChild(badge);
  });
})();
