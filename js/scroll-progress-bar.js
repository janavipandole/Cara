/**
 * Scroll Progress Indicator Bar
 * Shows a thin progress bar at the top of the page indicating how far
 * the user has scrolled through the content. Supports configurable color
 * and smooth animation.
 */
(function () {
  'use strict';

  var BAR_HEIGHT = 3;
  var DEFAULT_COLOR = '#088178';

  function createProgressBar() {
    if (document.getElementById('scrollProgressBar')) return;

    var bar = document.createElement('div');
    bar.id = 'scrollProgressBar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuenow', '0');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-label', 'Page scroll progress');

    var style = document.createElement('style');
    style.id = 'scrollProgressStyles';
    style.textContent =
      '#scrollProgressBar{position:fixed;top:0;left:0;height:' +
      BAR_HEIGHT +
      'px;background:' +
      DEFAULT_COLOR +
      ';z-index:99999;transition:width .1s linear;width:0;border-radius:0 2px 2px 0;pointer-events:none}';

    document.head.appendChild(style);
    document.body.appendChild(bar);
    return bar;
  }

  function getScrollPercent() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) return 0;
    return Math.min(100, Math.round((scrollTop / docHeight) * 100));
  }

  function updateProgress() {
    var bar = document.getElementById('scrollProgressBar');
    if (!bar) return;
    var pct = getScrollPercent();
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(pct));
  }

  function init() {
    createProgressBar();

    var ticking = false;
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraScrollProgress = {
    setColor: function (color) {
      var bar = document.getElementById('scrollProgressBar');
      if (bar) bar.style.background = color;
    },
    getPercent: getScrollPercent,
  };
})();
