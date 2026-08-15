(function () {
  'use strict';
  const form = document.querySelector('[data-price-filter]');
  if (!form) return;
  const minEl = form.querySelector('[data-price-min]');
  const maxEl = form.querySelector('[data-price-max]');
  const output = form.querySelector('[data-price-range-output]');
  if (!minEl || !maxEl) return;
  const update = () => {
    const min = parseInt(minEl.value, 10);
    const max = parseInt(maxEl.value, 10);
    if (output) output.textContent = '\u20B9' + min + ' - \u20B9' + max;
    form.dispatchEvent(new CustomEvent('cara:price-filter-change', { detail: { min, max } }));
  };
  minEl.addEventListener('input', update);
  maxEl.addEventListener('input', update);
  update();
})();
