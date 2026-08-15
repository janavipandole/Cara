(function () {
  'use strict';
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-quickview]');
    if (!trigger) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('cara:quickview-open', {
      detail: { url: trigger.getAttribute('data-quickview') },
    }));
  });
})();
