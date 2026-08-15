(function () {
  'use strict';
  const bar = document.querySelector('[data-sticky-atc]');
  const mainCta = document.querySelector('[data-pdp-add-to-cart]');
  if (!bar || !mainCta) return;
  const onScroll = () => {
    const rect = mainCta.getBoundingClientRect();
    const show = rect.bottom < 0;
    bar.classList.toggle('cara-sticky-atc-visible', show);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
