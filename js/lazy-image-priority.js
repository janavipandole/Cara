(function () {
  'use strict';
  const images = Array.from(document.querySelectorAll('img[data-lazy-priority]'));
  images.forEach((img, i) => {
    if (i < 2) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    } else if (img.loading !== 'lazy') {
      img.loading = 'lazy';
    }
  });
})();
