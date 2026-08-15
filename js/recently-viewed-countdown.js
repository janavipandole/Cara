(function () {
  'use strict';
  const rail = document.querySelector('[data-recently-viewed-rail]');
  if (!rail) return;
  const items = Array.from(rail.querySelectorAll('[data-rail-item]'));
  if (items.length < 2) return;
  let idx = 0;
  const step = () => {
    items[idx].hidden = true;
    idx = (idx + 1) % items.length;
    items[idx].hidden = false;
  };
  setInterval(step, 4000);
})();
