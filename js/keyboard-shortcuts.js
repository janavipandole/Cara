/**
 * Keyboard Shortcut Navigator
 * Provides keyboard shortcuts for common navigation actions
 * with a help overlay showing available shortcuts.
 */
(function () {
  'use strict';

  var shortcuts = [
    { keys: ['?'], label: 'Show keyboard shortcuts', action: 'toggleHelp' },
    { keys: ['/'], label: 'Focus search', action: 'focusSearch' },
    { keys: ['g', 'h'], label: 'Go to Home', url: 'index.html' },
    { keys: ['g', 's'], label: 'Go to Shop', url: 'shop.html' },
    { keys: ['g', 'c'], label: 'Go to Cart', url: 'cart.html' },
    { keys: ['g', 'w'], label: 'Go to Wishlist', url: 'wishlist.html' },
    { keys: ['g', 'o'], label: 'Go to Orders', url: 'order-history.html' },
    { keys: ['Escape'], label: 'Close modal / overlay', action: 'closeOverlay' },
  ];

  var pendingKey = null;
  var pendingTimeout = null;

  function createHelpOverlay() {
    if (document.getElementById('kbdHelpOverlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'kbdHelpOverlay';
    overlay.className = 'kbd-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Keyboard shortcuts');
    overlay.setAttribute('aria-hidden', 'true');

    var html =
      '<div class="kbd-modal">' +
      '<div class="kbd-header">' +
      '<h2>Keyboard Shortcuts</h2>' +
      '<button class="kbd-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="kbd-body"><table class="kbd-table"><tbody>';

    shortcuts.forEach(function (s) {
      html += '<tr><td class="kbd-keys">';
      s.keys.forEach(function (k, i) {
        if (i > 0) html += '<span class="kbd-sep">+</span>';
        html += '<kbd>' + k.toUpperCase() + '</kbd>';
      });
      html += '</td><td class="kbd-label">' + s.label + '</td></tr>';
    });

    html += '</tbody></table></div></div>';
    overlay.innerHTML = html;

    document.body.appendChild(overlay);

    overlay.querySelector('.kbd-close').addEventListener('click', hideHelp);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hideHelp();
    });
  }

  function showHelp() {
    createHelpOverlay();
    var overlay = document.getElementById('kbdHelpOverlay');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('open');
    overlay.querySelector('.kbd-close').focus();
  }

  function hideHelp() {
    var overlay = document.getElementById('kbdHelpOverlay');
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('open');
  }

  function focusSearch() {
    var searchInput =
      document.querySelector('input[type="search"]') ||
      document.querySelector('input[name="search"]') ||
      document.querySelector('#search-input, .search-input, [data-search-input]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  function closeOverlay() {
    var modals = document.querySelectorAll(
      '.size-chart-modal-overlay.open, .qv-overlay.open, .kbd-overlay.open, [role="dialog"][aria-hidden="false"]'
    );
    modals.forEach(function (m) {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  }

  function handleShortcut(action) {
    switch (action) {
      case 'toggleHelp':
        var overlay = document.getElementById('kbdHelpOverlay');
        if (overlay && overlay.classList.contains('open')) hideHelp();
        else showHelp();
        break;
      case 'focusSearch':
        focusSearch();
        break;
      case 'closeOverlay':
        closeOverlay();
        break;
    }
  }

  function handleKeydown(e) {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      e.target.isContentEditable
    ) {
      return;
    }

    var key = e.key.toLowerCase();

    if (pendingKey) {
      var combo = pendingKey + key;
      clearTimeout(pendingTimeout);
      pendingKey = null;

      var matched = shortcuts.find(function (s) {
        return s.keys.length === 2 && s.keys[0] === pendingKey && s.keys[1] === key;
      });

      if (matched) {
        e.preventDefault();
        if (matched.url) window.location.href = matched.url;
        else if (matched.action) handleShortcut(matched.action);
      }
      return;
    }

    var singleMatch = shortcuts.find(function (s) {
      return s.keys.length === 1 && s.keys[0] === key;
    });

    if (singleMatch) {
      if (singleMatch.keys.length === 1 && singleMatch.keys[0] !== '?' && singleMatch.keys[0] !== '/') {
        pendingKey = key;
        pendingTimeout = setTimeout(function () {
          pendingKey = null;
        }, 800);
        return;
      }
      e.preventDefault();
      if (singleMatch.url) window.location.href = singleMatch.url;
      else if (singleMatch.action) handleShortcut(singleMatch.action);
    }
  }

  function injectStyles() {
    if (document.getElementById('kbdStyles')) return;
    var s = document.createElement('style');
    s.id = 'kbdStyles';
    s.textContent =
      '.kbd-overlay{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}' +
      '.kbd-overlay.open{display:flex;opacity:1}' +
      '.kbd-modal{background:#fff;border-radius:12px;width:90%;max-width:480px;max-height:80vh;overflow:auto;box-shadow:0 25px 60px rgba(0,0,0,.2)}' +
      '.kbd-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e5e7eb}' +
      '.kbd-header h2{margin:0;font-size:18px;color:#0f172a}' +
      '.kbd-close{background:none;border:none;font-size:28px;cursor:pointer;color:#64748b}' +
      '.kbd-body{padding:16px 24px}' +
      '.kbd-table{width:100%;border-collapse:collapse}' +
      '.kbd-table tr{border-bottom:1px solid #f1f5f9}' +
      '.kbd-table td{padding:10px 0}' +
      '.kbd-keys{white-space:nowrap}' +
      '.kbd-keys kbd{display:inline-block;padding:3px 8px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;font-family:monospace;font-size:13px;color:#334155;min-width:24px;text-align:center}' +
      '.kbd-sep{margin:0 4px;color:#94a3b8}' +
      '.kbd-label{color:#475569;font-size:14px}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    document.addEventListener('keydown', handleKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraKeyboard = { showHelp: showHelp, hideHelp: hideHelp };
})();
