(function () {
  'use strict';
  const carousel = document.querySelector('[data-upsell-carousel]');
  if (!carousel) return;
  const track = carousel.querySelector('[data-carousel-track]');
  if (!track) return;
  const step = () => { track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }); };
  let timer = setInterval(step, 5000);
  const stop = () => clearInterval(timer);
  const start = () => { stop(); timer = setInterval(step, 5000); };
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('touchstart', stop, { passive: true });
  carousel.addEventListener('touchend', start, { passive: true });
})();
