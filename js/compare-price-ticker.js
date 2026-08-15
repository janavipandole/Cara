(function () {
  'use strict';
  document.querySelectorAll('[data-compare-price]').forEach((el) => {
    const sale = parseFloat(el.getAttribute('data-sale-price'));
    const mrp = parseFloat(el.getAttribute('data-compare-price'));
    if (Number.isNaN(sale) || Number.isNaN(mrp) || mrp <= sale) return;
    const pct = Math.round(((mrp - sale) / mrp) * 100);
    const tag = document.createElement('span');
    tag.className = 'cara-savings-tag';
    tag.textContent = pct + '% off';
    el.appendChild(tag);
  });
})();
