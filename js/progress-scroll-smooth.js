(function () {
  'use strict';
  const btn = document.querySelector('[data-smooth-scroll-top]');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
