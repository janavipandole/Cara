(function () {
  'use strict';
  document.querySelectorAll('[data-order-journey]').forEach((el) => {
    const steps = el.querySelectorAll('[data-journey-step]');
    const activeIdx = steps.length ? Array.from(steps).findIndex((s) => s.classList.contains('is-active')) : -1;
    steps.forEach((s, i) => {
      const dot = s.querySelector('.cara-journey-dot');
      if (dot) dot.setAttribute('aria-current', String(i === activeIdx));
    });
  });
})();
