/**
 * Copy Coupon Code on Click
 * Makes coupon/promo codes clickable to copy to clipboard with visual feedback.
 */
(function () {
  'use strict';

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function showCopiedFeedback(el) {
    var original = el.textContent;
    el.textContent = 'Copied!';
    el.classList.add('copied');
    setTimeout(function () {
      el.textContent = original;
      el.classList.remove('copied');
    }, 2000);
  }

  function init() {
    document.querySelectorAll('[data-copy-code]').forEach(function (el) {
      el.style.cursor = 'pointer';
      el.setAttribute('title', 'Click to copy code');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');

      var handler = function () {
        var code = el.dataset.copyCode || el.textContent.trim();
        copyToClipboard(code)
          .then(function () {
            showCopiedFeedback(el);
          })
          .catch(function () {
            if (typeof showToast === 'function') {
              showToast('Failed to copy code', 'error');
            }
          });
      };

      el.addEventListener('click', handler);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });
  }

  function injectStyles() {
    if (document.getElementById('copyCouponStyles')) return;
    var s = document.createElement('style');
    s.id = 'copyCouponStyles';
    s.textContent =
      '[data-copy-code]{position:relative;display:inline-block;padding:4px 12px;background:#f1f5f9;border:1px dashed #088178;border-radius:6px;font-family:monospace;font-size:14px;font-weight:700;color:#088178;transition:all .2s}' +
      '[data-copy-code]:hover{background:#e6f7f5;border-style:solid}' +
      '[data-copy-code].copied{background:#dcfce7;border-color:#16a34a;color:#16a34a;border-style:solid}';
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectStyles();
      init();
    });
  } else {
    injectStyles();
    init();
  }

  window.CaraCopyCode = { copy: copyToClipboard };
})();
