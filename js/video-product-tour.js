(function () {
  'use strict';
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-video-tour]');
    if (!trigger) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('cara:video-open', {
      detail: { src: trigger.getAttribute('data-video-tour') },
    }));
  });
  document.addEventListener('cara:close-overlays', () => {
    document.querySelectorAll('[data-video-element]').forEach((v) => v.pause());
  });
})();
