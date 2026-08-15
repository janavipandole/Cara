(function () {
  'use strict';
  const cartBtn = document.querySelector('[data-cart-trigger]');
  if (!cartBtn) return;
  const notify = () => {
    cartBtn.classList.remove('cara-cart-bounce');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('cara-cart-bounce');
  };
  window.addEventListener('cara:cart-updated', notify);
  document.addEventListener('cara:cart-updated', notify);
})();
