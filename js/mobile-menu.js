(function () {
  'use strict';
  const btn = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-menu]');
  if (!btn || !nav) return;
  const toggle = (open) => {
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('cara-menu-open', open);
    if (open) {
      const first = nav.querySelector('a, button');
      if (first) first.focus();
    }
  };
  btn.addEventListener('click', () => toggle(nav.hidden));
  document.addEventListener('cara:close-overlays', () => toggle(false));
})();
