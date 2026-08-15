(function () {
  'use strict';
  const bar = document.getElementById('cara-free-shipping-progress');
  if (!bar) return;
  const threshold = parseFloat(bar.getAttribute('data-threshold') || '0');
  const cartTotal = parseFloat(bar.getAttribute('data-cart-total') || '0');
  const fill = bar.querySelector('.cara-progress-fill');
  const label = bar.querySelector('.cara-progress-label');
  const pct = threshold > 0 ? Math.min((cartTotal / threshold) * 100, 100) : 0;
  if (fill) fill.style.width = pct + '%';
  if (label) {
    label.textContent = cartTotal >= threshold
      ? 'You have unlocked FREE shipping!'
      : '\u20B9' + Math.ceil(threshold - cartTotal) + ' away from FREE shipping';
  }
})();
