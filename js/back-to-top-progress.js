(function () {
  'use strict';
  const ring = document.getElementById('cara-scroll-progress-ring');
  if (!ring || !window.ScrollToTop) return;
  const indicator = ring.querySelector('.cara-progress-indicator');
  if (!indicator) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    indicator.setAttribute('stroke-dashoffset', String(100 - ratio * 100));
    ring.style.display = window.scrollY > 200 ? 'inline-flex' : 'none';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
