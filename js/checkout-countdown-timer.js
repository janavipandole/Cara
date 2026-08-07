/**
 * Checkout Countdown Timer
 * Displays a reservation timer on the checkout page showing how long
 * the user's cart items are held. Resets on activity. Persists across page refreshes.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cara_checkout_timer';
  var DEFAULT_DURATION = 10 * 60; // 10 minutes in seconds
  var WARNING_THRESHOLD = 2 * 60; // warn at 2 minutes

  function getStoredTimer() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && data.expiresAt && data.expiresAt > Date.now()) {
        return data;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function storeTimer(expiresAt) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt: expiresAt }));
    } catch (e) { /* ignore */ }
  }

  function clearTimer() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function createTimerElement() {
    if (document.getElementById('checkoutTimer')) return;

    var el = document.createElement('div');
    el.id = 'checkoutTimer';
    el.className = 'checkout-timer';
    el.setAttribute('role', 'timer');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<i class="fa fa-clock-o"></i> ' +
      '<span class="timer-text">Items reserved for: </span>' +
      '<span class="timer-value"></span>';

    var header = document.querySelector('main, .checkout-container, .section-p1');
    if (header) header.insertBefore(el, header.firstChild);
    else document.body.appendChild(el);

    return el;
  }

  function injectStyles() {
    if (document.getElementById('timerStyles')) return;
    var s = document.createElement('style');
    s.id = 'timerStyles';
    s.textContent =
      '.checkout-timer{display:flex;align-items:center;gap:8px;padding:12px 20px;background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;margin-bottom:20px;font-size:14px;color:#92400e}' +
      '.checkout-timer.warning{background:#fee2e2;border-color:#fca5a5;color:#991b1b;animation:pulse-warning 1s infinite}' +
      '.checkout-timer.expired{background:#fecaca;border-color:#ef4444;color:#7f1d1d}' +
      '.timer-value{font-weight:700;font-family:monospace;font-size:16px}' +
      '@keyframes pulse-warning{0%,100%{opacity:1}50%{opacity:.7}}';
    document.head.appendChild(s);
  }

  var intervalId = null;

  function startTimer(expiresAt) {
    var el = createTimerElement();
    var valueEl = el.querySelector('.timer-value');

    if (intervalId) clearInterval(intervalId);

    function tick() {
      var remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      valueEl.textContent = formatTime(remaining);

      el.classList.remove('warning', 'expired');
      if (remaining <= 0) {
        el.classList.add('expired');
        valueEl.textContent = '00:00';
        clearInterval(intervalId);
        clearTimer();
        if (typeof showToast === 'function') {
          showToast('Your reservation has expired. Please re-add items to your cart.', 'warning');
        }
      } else if (remaining <= WARNING_THRESHOLD) {
        el.classList.add('warning');
      }
    }

    tick();
    intervalId = setInterval(tick, 1000);
  }

  function init() {
    if (!document.getElementById('checkoutTimer') && !document.querySelector('.checkout-container, #checkout-form')) return;

    injectStyles();

    var stored = getStoredTimer();
    if (stored) {
      startTimer(stored.expiresAt);
    } else {
      var expiresAt = Date.now() + DEFAULT_DURATION * 1000;
      storeTimer(expiresAt);
      startTimer(expiresAt);
    }

    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
      document.addEventListener(
        evt,
        function () {
          var stored = getStoredTimer();
          if (stored && stored.expiresAt - Date.now() > WARNING_THRESHOLD * 1000) {
            var newExp = Date.now() + DEFAULT_DURATION * 1000;
            storeTimer(newExp);
          }
        },
        { passive: true }
      );
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraCheckoutTimer = {
    reset: function () {
      var expiresAt = Date.now() + DEFAULT_DURATION * 1000;
      storeTimer(expiresAt);
      startTimer(expiresAt);
    },
    clear: clearTimer,
  };
})();
