(function () {
  'use strict';
  document.querySelectorAll('img[width][height]').forEach((img) => {
    if (img.hasAttribute('data-aspect-applied')) return;
    const w = parseInt(img.getAttribute('width'), 10);
    const h = parseInt(img.getAttribute('height'), 10);
    if (Number.isNaN(w) || Number.isNaN(h) || h === 0) return;
    img.style.aspectRatio = String(w) + ' / ' + String(h);
    img.setAttribute('data-aspect-applied', 'true');
  });
})();
