(function () {
  'use strict';
  const closeAll = () => {
    document.querySelectorAll('[data-modal][hidden="false"], [data-modal]:not([hidden])').forEach((m) => {
      m.hidden = true;
    });
  };
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open-modal]');
    if (opener) {
      closeAll();
      const target = document.querySelector(opener.getAttribute('data-open-modal'));
      if (target) target.hidden = false;
    }
    if (e.target.matches('[data-modal-backdrop], [data-close-modal]')) {
      closeAll();
    }
  });
  document.addEventListener('cara:close-overlays', closeAll);
})();
