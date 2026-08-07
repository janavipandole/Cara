/**
 * Back to Top with Progress Ring
 * A floating circular button that shows scroll progress as an SVG ring
 * and smoothly scrolls to top on click.
 */
(function () {
  'use strict';

  var SIZE = 48;
  var STROKE = 3;
  var RADIUS = (SIZE - STROKE) / 2;
  var CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  function createButton() {
    if (document.getElementById('backToTopBtn')) return;

    var btn = document.createElement('button');
    btn.id = 'backToTopBtn';
    btn.className = 'btt-btn';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('title', 'Back to top');

    btn.innerHTML =
      '<svg class="btt-ring" width="' + SIZE + '" height="' + SIZE + '">' +
      '<circle class="btt-ring-bg" cx="' + SIZE / 2 + '" cy="' + SIZE / 2 + '" r="' + RADIUS + '" />' +
      '<circle class="btt-ring-progress" cx="' + SIZE / 2 + '" cy="' + SIZE / 2 + '" r="' + RADIUS + '" />' +
      '</svg>' +
      '<span class="btt-arrow">&uarr;</span>';

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(btn);
    return btn;
  }

  function updateProgress() {
    var btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;

    var progress = btn.querySelector('.btt-ring-progress');
    if (progress) {
      var offset = CIRCUMFERENCE - pct * CIRCUMFERENCE;
      progress.style.strokeDashoffset = String(offset);
    }

    btn.classList.toggle('visible', scrollTop > 300);
  }

  function injectStyles() {
    if (document.getElementById('bttStyles')) return;
    var s = document.createElement('style');
    s.id = 'bttStyles';
    s.textContent =
      '.btt-btn{position:fixed;bottom:30px;right:30px;z-index:9998;width:' + SIZE + 'px;height:' + SIZE + 'px;border-radius:50%;border:none;background:#088178;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transform:translateY(10px);transition:all .3s;box-shadow:0 4px 14px rgba(8,129,120,.35)}' +
      '.btt-btn.visible{opacity:1;visibility:visible;transform:translateY(0)}' +
      '.btt-btn:hover{background:#066e68;transform:translateY(-2px)!important}' +
      '.btt-ring{position:absolute;top:0;left:0;transform:rotate(-90deg)}' +
      '.btt-ring-bg{fill:none;stroke:rgba(255,255,255,.2);stroke-width:' + STROKE + '}' +
      '.btt-ring-progress{fill:none;stroke:#fff;stroke-width:' + STROKE + ';stroke-dasharray:' + CIRCUMFERENCE + ';stroke-dashoffset:' + CIRCUMFERENCE + ';stroke-linecap:round;transition:stroke-dashoffset .15s}' +
      '.btt-arrow{font-size:18px;font-weight:700;position:relative;z-index:1}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    createButton();

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
})();
