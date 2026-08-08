// Notification management layer — queues, stacks, auto-dismiss, manual dismiss
(function () {
  'use strict';

  var DEFAULT_DURATION = 4000;
  var MAX_STACK = 5;
  var queue = [];
  var isProcessing = false;

  function getContainer() {
    var existing = document.getElementById('cara-notif-container');
    if (existing) return existing;
    var el = document.createElement('div');
    el.id = 'cara-notif-container';
    el.style.cssText =
      'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(el);
    return el;
  }

  function createNotifEl(message, type) {
    var el = document.createElement('div');
    var colors = {
      info: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    };
    var color = colors[type] || colors.info;
    el.style.cssText = [
      'padding:12px 16px',
      'border-radius:6px',
      'color:#fff',
      'font-size:14px',
      'font-family:sans-serif',
      'box-shadow:0 2px 8px rgba(0,0,0,0.2)',
      'cursor:pointer',
      'background:' + color,
      'min-width:200px',
      'max-width:320px',
      'opacity:0',
      'transition:opacity 0.3s',
    ].join(';');
    el.textContent = message;
    el.setAttribute('role', 'alert');
    return el;
  }

  function processQueue() {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;
    var item = queue.shift();
    showImmediate(item.message, item.type, item.duration);
  }

  function showImmediate(message, type, duration) {
    var container = getContainer();
    var el = createNotifEl(message, type);
    container.appendChild(el);

    // Stack limit: remove oldest if exceeded
    var children = Array.from(container.children);
    if (children.length > MAX_STACK) {
      var oldest = children[0];
      oldest.style.opacity = '0';
      setTimeout(function () {
        oldest.remove();
      }, 300);
    }

    // Fade in
    requestAnimationFrame(function () {
      el.style.opacity = '1';
    });

    // Dismiss on click
    el.addEventListener('click', function () {
      dismiss(el);
    });

    // Auto-dismiss
    var timer = setTimeout(function () {
      dismiss(el);
    }, duration || DEFAULT_DURATION);
    el._dismissTimer = timer;
  }

  function dismiss(el) {
    if (!el || !el.parentNode) return;
    clearTimeout(el._dismissTimer);
    el.style.opacity = '0';
    setTimeout(function () {
      if (el.parentNode) el.remove();
      isProcessing = false;
      processQueue();
    }, 300);
  }

  function notify(message, type, duration) {
    if (typeof document === 'undefined') return;
    queue.push({
      message: message,
      type: type || 'info',
      duration: duration || DEFAULT_DURATION,
    });
    processQueue();
  }

  window.CaraNotifications = {
    info: function (msg, dur) {
      notify(msg, 'info', dur);
    },
    success: function (msg, dur) {
      notify(msg, 'success', dur);
    },
    warning: function (msg, dur) {
      notify(msg, 'warning', dur);
    },
    error: function (msg, dur) {
      notify(msg, 'error', dur);
    },
    dismiss: dismiss,
  };
})();
