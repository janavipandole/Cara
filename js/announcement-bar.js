(function () {
  'use strict';
  const bar = document.getElementById('cara-announcement-bar');
  if (!bar) return;
  const items = Array.from(bar.querySelectorAll('[data-announcement]'));
  if (items.length < 2) return;
  let index = 0;
  const duration = parseInt(bar.getAttribute('data-announcement-interval') || '5000', 10);
  items.forEach((el, i) => { el.style.display = i === 0 ? 'block' : 'none'; });
  setInterval(() => {
    items[index].style.display = 'none';
    index = (index + 1) % items.length;
    items[index].style.display = 'block';
  }, duration);
})();
