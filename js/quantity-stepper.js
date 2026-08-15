(function () {
  'use strict';
  document.querySelectorAll('[data-quantity-stepper]').forEach((el) => {
    const input = el.querySelector('input[type="number"]');
    const minus = el.querySelector('[data-qty-minus]');
    const plus = el.querySelector('[data-qty-plus]');
    if (!input || !minus || !plus) return;
    const clamp = (v) => {
      const min = parseInt(input.min || '1', 10);
      const max = input.max ? parseInt(input.max, 10) : Infinity;
      return Math.min(Math.max(v, min), max);
    };
    minus.addEventListener('click', () => {
      input.value = String(clamp(parseInt(input.value || '1', 10) - 1));
      input.dispatchEvent(new Event('change'));
    });
    plus.addEventListener('click', () => {
      input.value = String(clamp(parseInt(input.value || '1', 10) + 1));
      input.dispatchEvent(new Event('change'));
    });
  });
})();
