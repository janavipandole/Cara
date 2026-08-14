(function () {
  'use strict';
  document.querySelectorAll('[data-gift-wrap]').forEach((el) => {
    const box = el.querySelector('[type="checkbox"]');
    const priceEl = el.querySelector('[data-gift-price]');
    if (!box || !priceEl) return;
    const base = parseFloat(priceEl.getAttribute('data-gift-price') || '0');
    const show = () => {
      priceEl.textContent = box.checked ? '+' + '\u20B9' + base : '';
    };
    box.addEventListener('change', () => {
      show();
      window.dispatchEvent(new CustomEvent('cara:gift-wrap-change', { detail: { checked: box.checked } }));
    });
    show();
  });
})();
