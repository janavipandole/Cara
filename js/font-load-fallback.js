(function () {
  'use strict';
  const TIMEOUT = 3000;
  let loaded = false;
  const fallback = () => {
    if (loaded) return;
    document.documentElement.classList.add('cara-font-fallback');
  };
  setTimeout(fallback, TIMEOUT);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { loaded = true; });
  }
})();
