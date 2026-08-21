/**
 * Sale Countdown Timer
 * Renders a live countdown to a sale end date on any element with
 * [data-sale-countdown]. The target date is read from the
 * data-sale-countdown-end attribute (an ISO 8601 string). When the
 * countdown reaches zero the units freeze at 00 and the container gets
 * a `sale-countdown--ended` class so the UI can be dimmed.
 */
(function () {
  'use strict';

  var DAY = 86400000;
  var HOUR = 3600000;
  var MINUTE = 60000;
  var SECOND = 1000;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function buildUnits(root) {
    var units = {};
    root.querySelectorAll('[data-unit]').forEach(function (el) {
      units[el.getAttribute('data-unit')] = el.querySelector(
        '.sale-countdown__value',
      );
    });
    return units;
  }

  function render(root, units, remaining) {
    if (remaining <= 0) {
      remaining = 0;
      root.classList.add('sale-countdown--ended');
    }
    units.days.textContent = pad(Math.floor(remaining / DAY));
    units.hours.textContent = pad(Math.floor((remaining % DAY) / HOUR));
    units.minutes.textContent = pad(Math.floor((remaining % HOUR) / MINUTE));
    units.seconds.textContent = pad(Math.floor((remaining % MINUTE) / SECOND));
  }

  function init(root) {
    var endAttr = root.getAttribute('data-sale-countdown-end');
    if (!endAttr) return;
    var end = Date.parse(endAttr);
    if (Number.isNaN(end)) return;

    var units = buildUnits(root);
    var reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function tick() {
      render(root, units, end - Date.now());
    }
    tick();
    if (reduce) return;
    root._saleCountdownTimer = setInterval(tick, SECOND);
  }

  function setup() {
    document.querySelectorAll('[data-sale-countdown]').forEach(function (root) {
      if (root._saleCountdownTimer === undefined) init(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
