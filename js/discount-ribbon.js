(function () {
  'use strict';
  document.querySelectorAll('[data-product-price]').forEach((card) => {
    if (card.querySelector('.cara-discount-ribbon')) return;
    const price = parseFloat(card.getAttribute('data-product-price'));
    const mrp = parseFloat(card.getAttribute('data-product-mrp'));
    if (Number.isNaN(price) || Number.isNaN(mrp) || mrp <= price) return;
    const pct = Math.round(((mrp - price) / mrp) * 100);
    if (pct < 10) return;
    const ribbon = document.createElement('span');
    ribbon.className = 'cara-discount-ribbon';
    ribbon.textContent = pct + '% OFF';
    card.appendChild(ribbon);
  });
})();
