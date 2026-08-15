(function () {
  'use strict';
  document.addEventListener('click', (e) => {
    const heart = e.target.closest('[data-wishlist-heart]');
    if (!heart) return;
    heart.classList.remove('cara-heart-burst');
    void heart.offsetWidth;
    heart.classList.add('cara-heart-burst');
    heart.setAttribute('aria-pressed', String(!(heart.getAttribute('aria-pressed') === 'true')));
  });
})();
