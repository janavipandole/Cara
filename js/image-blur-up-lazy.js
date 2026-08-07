/**
 * Image Lazy Load with Blur-Up Effect
 * Loads images progressively with a low-quality placeholder that blurs
 * into the full image once loaded. Uses IntersectionObserver.
 */
(function () {
  'use strict';

  var BLUR_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3C/svg%3E';

  function processImage(img) {
    if (img.dataset.blurLoaded) return;

    var src = img.dataset.src || img.getAttribute('data-src');
    if (!src) return;

    img.style.filter = 'blur(10px)';
    img.style.transition = 'filter 0.5s ease';
    img.classList.add('blur-loading');

    var tempImg = new Image();
    tempImg.onload = function () {
      img.src = src;
      img.style.filter = 'blur(0)';
      img.classList.remove('blur-loading');
      img.classList.add('blur-loaded');
      img.dataset.blurLoaded = 'true';
    };
    tempImg.onerror = function () {
      img.style.filter = 'none';
      img.classList.remove('blur-loading');
    };
    tempImg.src = src;
  }

  function injectStyles() {
    if (document.getElementById('blurUpStyles')) return;
    var s = document.createElement('style');
    s.id = 'blurUpStyles';
    s.textContent =
      '.blur-loading{min-height:100px;background-size:cover;background-position:center}' +
      '.blur-loaded{transition:filter .5s ease}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();

    document.querySelectorAll('img[data-src]').forEach(function (img) {
      if (!img.src || img.src === window.location.href) {
        img.src = BLUR_PLACEHOLDER;
      }
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              processImage(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '200px 0px' }
      );

      document.querySelectorAll('img[data-src]').forEach(function (img) {
        observer.observe(img);
      });
    } else {
      document.querySelectorAll('img[data-src]').forEach(processImage);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraBlurUp = { process: processImage };
})();
