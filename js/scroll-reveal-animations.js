/**
 * Scroll Reveal Animation System
 * Animates elements into view as they enter the viewport using
 * IntersectionObserver. Supports multiple animation types.
 */
(function () {
  'use strict';

  var DEFAULT_ANIMATION = 'fade-up';
  var DEFAULT_DELAY = 0;
  var DEFAULT_DURATION = 600;

  var ANIMATIONS = {
    'fade-up': {
      from: 'opacity:0;transform:translateY(30px)',
      to: 'opacity:1;transform:translateY(0)',
    },
    'fade-down': {
      from: 'opacity:0;transform:translateY(-30px)',
      to: 'opacity:1;transform:translateY(0)',
    },
    'fade-left': {
      from: 'opacity:0;transform:translateX(30px)',
      to: 'opacity:1;transform:translateX(0)',
    },
    'fade-right': {
      from: 'opacity:0;transform:translateX(-30px)',
      to: 'opacity:1;transform:translateX(0)',
    },
    'scale-up': {
      from: 'opacity:0;transform:scale(0.9)',
      to: 'opacity:1;transform:scale(1)',
    },
    'rotate-in': {
      from: 'opacity:0;transform:rotate(-5deg) scale(0.95)',
      to: 'opacity:1;transform:rotate(0) scale(1)',
    },
  };

  function injectStyles() {
    if (document.getElementById('revealStyles')) return;
    var css = '[data-reveal]{opacity:0;transition-property:opacity,transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-fill-mode:both}';
    Object.keys(ANIMATIONS).forEach(function (name) {
      css += '[data-reveal="' + name + '"].revealed{' + ANIMATIONS[name].to + '}';
    });
    var s = document.createElement('style');
    s.id = 'revealStyles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var anim = el.dataset.reveal || DEFAULT_ANIMATION;
      var animData = ANIMATIONS[anim] || ANIMATIONS[DEFAULT_ANIMATION];
      var delay = parseInt(el.dataset.revealDelay) || DEFAULT_DELAY;
      var duration = parseInt(el.dataset.revealDuration) || DEFAULT_DURATION;

      el.style.cssText += animData.from + ';transition-delay:' + delay + 'ms;transition-duration:' + duration + 'ms';
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        observer.observe(el);
      });
    } else {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraReveal = { init: init };
})();
