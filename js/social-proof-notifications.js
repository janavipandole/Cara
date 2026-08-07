/**
 * Social Proof Notification Bar
 * Shows recent purchase/view notifications at the bottom-left corner
 * to build trust and urgency. Configurable and dismissible.
 */
(function () {
  'use strict';

  var NOTIFICATIONS = [
    { name: 'Sarah from Mumbai', action: 'purchased', item: 'Classic White Sneakers', time: '2 min ago' },
    { name: 'Rahul from Delhi', action: 'purchased', item: 'Denim Jacket', time: '5 min ago' },
    { name: 'Priya from Bangalore', action: 'added to wishlist', item: 'Summer Dress', time: '8 min ago' },
    { name: 'Alex from Pune', action: 'purchased', item: 'Running Shoes', time: '12 min ago' },
    { name: 'Neha from Chennai', action: 'purchased', item: 'Cotton Hoodie', time: '15 min ago' },
    { name: 'Vikram from Jaipur', action: 'viewed', item: 'Leather Wallet', time: '18 min ago' },
    { name: 'Anita from Kolkata', action: 'purchased', item: 'Floral Top', time: '22 min ago' },
    { name: 'Karan from Hyderabad', action: 'added to wishlist', item: 'Sunglasses', time: '25 min ago' },
  ];

  var STORAGE_KEY = 'cara_social_proof';
  var SHOW_INTERVAL = 45000;
  var DISPLAY_DURATION = 5000;
  var currentIdx = 0;
  var intervalId = null;

  function isDisabled() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'disabled';
    } catch (e) {
      return false;
    }
  }

  function disable() {
    try {
      localStorage.setItem(STORAGE_KEY, 'disabled');
    } catch (e) { /* ignore */ }
    hide();
    if (intervalId) clearInterval(intervalId);
  }

  function createNotificationEl() {
    if (document.getElementById('socialProofBar')) return;

    var el = document.createElement('div');
    el.id = 'socialProofBar';
    el.className = 'sp-bar';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="sp-content">' +
      '<div class="sp-avatar"></div>' +
      '<div class="sp-text">' +
      '<span class="sp-name"></span> ' +
      '<span class="sp-action"></span> ' +
      '<span class="sp-item"></span>' +
      '</div>' +
      '<span class="sp-time"></span>' +
      '</div>' +
      '<button class="sp-dismiss" aria-label="Dismiss notification">&times;</button>';

    document.body.appendChild(el);

    el.querySelector('.sp-dismiss').addEventListener('click', function () {
      disable();
    });
  }

  function showNotification() {
    if (isDisabled()) return;
    createNotificationEl();

    var el = document.getElementById('socialProofBar');
    var notif = NOTIFICATIONS[currentIdx % NOTIFICATIONS.length];

    el.querySelector('.sp-avatar').textContent = notif.name.charAt(0);
    el.querySelector('.sp-name').textContent = notif.name;
    el.querySelector('.sp-action').textContent = notif.action;
    el.querySelector('.sp-item').textContent = notif.item;
    el.querySelector('.sp-time').textContent = notif.time;

    el.classList.add('visible');

    setTimeout(function () {
      el.classList.remove('visible');
    }, DISPLAY_DURATION);

    currentIdx++;
  }

  function injectStyles() {
    if (document.getElementById('spStyles')) return;
    var s = document.createElement('style');
    s.id = 'spStyles';
    s.textContent =
      '.sp-bar{position:fixed;bottom:24px;left:24px;z-index:9997;background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 8px 30px rgba(0,0,0,.12);display:flex;align-items:center;gap:12px;max-width:360px;transform:translateX(-120%);transition:transform .4s cubic-bezier(.4,0,.2,1);border:1px solid #e5e7eb}' +
      '.sp-bar.visible{transform:translateX(0)}' +
      '.sp-content{display:flex;align-items:center;gap:10px;flex:1;min-width:0}' +
      '.sp-avatar{width:36px;height:36px;border-radius:50%;background:#088178;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}' +
      '.sp-text{font-size:13px;color:#334155;line-height:1.4}' +
      '.sp-name{font-weight:600;color:#0f172a}' +
      '.sp-item{font-weight:600;color:#088178}' +
      '.sp-time{font-size:11px;color:#94a3b8;white-space:nowrap}' +
      '.sp-dismiss{background:none;border:none;font-size:18px;cursor:pointer;color:#94a3b8;padding:0 4px}' +
      '.sp-dismiss:hover{color:#ef4444}';
    document.head.appendChild(s);
  }

  function init() {
    if (isDisabled()) return;
    injectStyles();
    intervalId = setInterval(showNotification, SHOW_INTERVAL);
    setTimeout(showNotification, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraSocialProof = { enable: init, disable: disable };
})();
