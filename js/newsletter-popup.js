/**
 * Newsletter Popup with Timer
 * Shows a non-intrusive newsletter signup popup after a configurable delay,
 * with a 7-day cooldown before showing again.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cara_newsletter_popup';
  var SHOW_DELAY = 30000; // 30 seconds
  var COOLDOWN_DAYS = 7;

  function canShow() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!data || !data.dismissedAt) return true;
      var elapsed = Date.now() - data.dismissedAt;
      return elapsed > COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    } catch (e) {
      return true;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    } catch (e) { /* ignore */ }
  }

  function createPopup() {
    if (document.getElementById('newsletterPopup')) return;

    var overlay = document.createElement('div');
    overlay.id = 'newsletterPopup';
    overlay.className = 'nl-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Newsletter signup');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML =
      '<div class="nl-modal">' +
      '<button class="nl-close" aria-label="Close newsletter popup">&times;</button>' +
      '<div class="nl-content">' +
      '<div class="nl-icon">&#9993;</div>' +
      '<h2 class="nl-title">Stay in the Loop</h2>' +
      '<p class="nl-desc">Get 10% off your first order and be the first to know about new arrivals and exclusive deals.</p>' +
      '<form class="nl-form" id="nlForm">' +
      '<div class="nl-input-group">' +
      '<input type="email" class="nl-email" placeholder="Enter your email" required aria-label="Email address" />' +
      '<button type="submit" class="nl-submit">Subscribe</button>' +
      '</div>' +
      '<p class="nl-privacy">We respect your privacy. Unsubscribe anytime.</p>' +
      '</form>' +
      '<div class="nl-success" style="display:none">' +
      '<div class="nl-success-icon">&#10003;</div>' +
      '<p>Thanks for subscribing! Check your email for your 10% discount code.</p>' +
      '</div>' +
      '</div>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelector('.nl-close').addEventListener('click', hidePopup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hidePopup();
    });

    overlay.querySelector('#nlForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = this.querySelector('.nl-email').value;
      if (email) {
        this.style.display = 'none';
        overlay.querySelector('.nl-success').style.display = 'block';
        setTimeout(hidePopup, 3000);
      }
    });
  }

  function showPopup() {
    if (!canShow()) return;
    createPopup();
    var popup = document.getElementById('newsletterPopup');
    popup.setAttribute('aria-hidden', 'false');
    popup.classList.add('open');
    document.body.style.overflow = 'hidden';
    popup.querySelector('.nl-email').focus();
  }

  function hidePopup() {
    var popup = document.getElementById('newsletterPopup');
    if (!popup) return;
    popup.setAttribute('aria-hidden', 'true');
    popup.classList.remove('open');
    document.body.style.overflow = '';
    markDismissed();
  }

  function injectStyles() {
    if (document.getElementById('nlStyles')) return;
    var s = document.createElement('style');
    s.id = 'nlStyles';
    s.textContent =
      '.nl-overlay{position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity .3s}' +
      '.nl-overlay.open{display:flex;opacity:1}' +
      '.nl-modal{background:#fff;border-radius:16px;width:92%;max-width:440px;position:relative;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,.25)}' +
      '.nl-close{position:absolute;top:12px;right:16px;background:none;border:none;font-size:28px;cursor:pointer;color:#64748b;z-index:2}' +
      '.nl-close:hover{color:#0f172a}' +
      '.nl-content{padding:40px 32px;text-align:center}' +
      '.nl-icon{font-size:48px;margin-bottom:12px}' +
      '.nl-title{margin:0 0 8px;font-size:24px;color:#0f172a}' +
      '.nl-desc{font-size:14px;color:#64748b;line-height:1.6;margin-bottom:24px}' +
      '.nl-input-group{display:flex;gap:0;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0}' +
      '.nl-email{flex:1;padding:12px 16px;border:none;font-size:14px;outline:none}' +
      '.nl-submit{padding:12px 20px;background:#088178;color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}' +
      '.nl-submit:hover{background:#066e68}' +
      '.nl-privacy{margin-top:12px;font-size:11px;color:#94a3b8}' +
      '.nl-success{padding:20px 0}' +
      '.nl-success-icon{width:48px;height:48px;border-radius:50%;background:#dcfce7;color:#16a34a;font-size:24px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    setTimeout(showPopup, SHOW_DELAY);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraNewsletter = { show: showPopup, hide: hidePopup };
})();
