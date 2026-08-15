(function () {
  'use strict';
  const KEY = 'cara_newsletter_seen';
  let seen = false;
  try { seen = localStorage.getItem(KEY) === '1'; } catch (e) { seen = false; }
  if (seen) return;
  const popup = document.getElementById('cara-newsletter-popup');
  if (!popup) return;
  const show = () => {
    popup.hidden = false;
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  };
  const close = popup.querySelector('[data-newsletter-close]');
  if (close) close.addEventListener('click', () => { popup.hidden = true; });
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) show();
  });
})();
