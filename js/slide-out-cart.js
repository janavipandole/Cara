(function () {
  'use strict';
  const drawer = document.querySelector('[data-slideout-cart]');
  const openBtn = document.querySelector('[data-cart-trigger]');
  const closeBtn = drawer && drawer.querySelector('[data-cart-close]');
  if (!drawer || !openBtn) return;
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('cara-cart-open');
    const first = drawer.querySelector('a, button');
    if (first) first.focus();
  };
  const close = () => {
    drawer.hidden = true;
    document.body.classList.remove('cara-cart-open');
    if (lastFocus) lastFocus.focus();
  };
  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('cara:close-overlays', close);
  document.addEventListener('cara:cart-updated', open);
})();
