/**
 * Exit-Intent Discount Pop-up
 * Shows a one-time discount pop-up when a desktop visitor moves their
 * cursor out of the top of the viewport (a strong exit-intent signal).
 * On touch devices it falls back to a scroll-based trigger: if the user
 * scrolls back up after passing 60% of the page, the pop-up is shown.
 *
 * The pop-up appears at most once per browser (sessionStorage flag) so it
 * never nags returning visitors in the same session. It honours
 * prefers-reduced-motion (the CSS disables the entrance animation).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'exitIntentShown';
  var SCROLL_THRESHOLD = 0.6;

  function alreadyShown() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  function markShown() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* sessionStorage may be unavailable; fail silently */
    }
  }

  function openPopup(overlay) {
    if (alreadyShown() || !overlay) return;
    overlay.classList.add('is-open');
    markShown();
    var firstInput = overlay.querySelector('input, button');
    if (firstInput) firstInput.focus();
  }

  function closePopup(overlay) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
  }

  function isCoarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  function setupExitIntent(overlay) {
    if (alreadyShown()) return;

    if (isCoarsePointer()) {
      var triggered = false;
      window.addEventListener(
        'scroll',
        function () {
          if (triggered || alreadyShown()) return;
          var scrolled =
            window.scrollY / (document.body.scrollHeight - window.innerHeight);
          if (scrolled > SCROLL_THRESHOLD) triggered = true;
          else if (triggered && scrolled < SCROLL_THRESHOLD - 0.1) {
            openPopup(overlay);
          }
        },
        { passive: true },
      );
      return;
    }

    document.addEventListener('mouseout', function (e) {
      if (e.relatedTarget || e.toElement) return;
      if (e.clientY < 0) openPopup(overlay);
    });
  }

  function init() {
    var overlay = document.getElementById('exit-intent-overlay');
    if (!overlay) return;

    var closeBtn = overlay.querySelector('[data-exit-intent-close]');
    var form = overlay.querySelector('[data-exit-intent-form]');
    var success = overlay.querySelector('[data-exit-intent-success]');
    var cta = overlay.querySelector('[data-exit-intent-cta]');

    if (closeBtn)
      closeBtn.addEventListener('click', function () {
        closePopup(overlay);
      });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup(overlay);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup(overlay);
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = form.querySelector('input[type="email"]');
        if (email && !email.value.trim()) return;
        if (success) success.classList.add('is-visible');
        if (form) form.style.display = 'none';
        if (cta) cta.style.display = 'none';
      });
    }

    setupExitIntent(overlay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
