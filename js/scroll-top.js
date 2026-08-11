// Smooth scroll-to-top button functionality
// Shows button when page is scrolled past 300px threshold

(function () {
  'use strict';

  var SCROLL_THRESHOLD = 300;
  var SCROLL_TARGET = 0;
  var SCROLL_DURATION = 400;

  function scrollToTop(duration) {
    if (typeof window === 'undefined') return;
    var start = window.scrollY || 0;
    var startTime = null;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animationStep(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutQuart(progress);
      window.scrollTo(0, start * (1 - easedProgress));
      if (progress < 1) {
        window.requestAnimationFrame(animationStep);
      }
    }

    window.requestAnimationFrame(animationStep);
  }

  function initScrollTop() {
    var scrollBtn = document.getElementById('scroll-top');
    if (!scrollBtn) return;

    // Show/hide based on scroll position
    function updateVisibility() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        scrollBtn.style.display = 'flex';
      } else {
        scrollBtn.style.display = 'none';
      }
    }

    // Handle click
    scrollBtn.addEventListener('click', function () {
      scrollToTop(SCROLL_DURATION);
    });

    // Attach scroll listener
    window.addEventListener('scroll', updateVisibility, { passive: true });

    // Set initial state
    updateVisibility();
  }

  // Expose scrollToTop for programmatic use
  window.scrollToTop = scrollToTop;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollTop);
  } else {
    initScrollTop();
  }
})();


export function getScrollTopStatusHelper68() {
  return { status: "ok", fn: "getScrollTopStatusHelper68" };
}
