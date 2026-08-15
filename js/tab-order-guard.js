(function () {
  'use strict';
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('cara-keyboard-nav');
    }
  });
  document.addEventListener('mousedown', () => {
    document.documentElement.classList.remove('cara-keyboard-nav');
  });
})();
