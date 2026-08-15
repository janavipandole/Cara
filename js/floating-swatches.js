(function () {
  'use strict';
  document.querySelectorAll('[data-floating-swatches]').forEach((card) => {
    const variants = card.querySelectorAll('[data-quick-variant]');
    if (!variants.length) return;
    const bar = document.createElement('div');
    bar.className = 'cara-floating-swatches';
    variants.forEach((v) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'cara-quick-variant';
      dot.style.background = v.getAttribute('data-color') || '#ccc';
      dot.setAttribute('aria-label', v.getAttribute('data-label') || 'variant');
      dot.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('cara:quick-add', { detail: { sku: v.dataset.quickVariant } }));
      });
      bar.appendChild(dot);
    });
    card.appendChild(bar);
  });
})();
