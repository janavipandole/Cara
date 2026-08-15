(function () {
  'use strict';
  document.querySelectorAll('[data-swatch-group]').forEach((group) => {
    const swatches = Array.from(group.querySelectorAll('[data-swatch]'));
    if (!swatches.length) return;
    swatches.forEach((s) => {
      s.setAttribute('role', 'radio');
      s.setAttribute('aria-checked', String(s.classList.contains('selected')));
      s.addEventListener('click', () => {
        swatches.forEach((o) => {
          o.classList.remove('selected');
          o.setAttribute('aria-checked', 'false');
        });
        s.classList.add('selected');
        s.setAttribute('aria-checked', 'true');
        group.dispatchEvent(new CustomEvent('cara:swatch-change', { detail: { value: s.dataset.swatch } }));
      });
    });
  });
})();
