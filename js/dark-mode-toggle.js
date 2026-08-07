/**
 * Dark Mode Toggle with System Preference Detection
 * Provides a toggle button that switches between light/dark themes,
 * respects prefers-color-scheme, and persists user choice.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cara_theme_pref';

  function getStoredPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storePreference(pref) {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch (e) { /* ignore */ }
  }

  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getEffectiveTheme() {
    var stored = getStoredPreference();
    if (stored === 'dark' || stored === 'light') return stored;
    return getSystemPreference();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    }

    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    var btn = document.querySelector('.dark-mode-toggle');
    if (!btn) return;
    var icon = btn.querySelector('.dm-icon');
    var label = btn.querySelector('.dm-label');
    if (icon) icon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }

  function toggleTheme() {
    var current = getEffectiveTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    storePreference(next);
    applyTheme(next);
  }

  function injectStyles() {
    if (document.getElementById('dmStyles')) return;
    var s = document.createElement('style');
    s.id = 'dmStyles';
    s.textContent =
      '[data-theme="dark"]{color-scheme:dark}' +
      '[data-theme="dark"] body{background:#0f172a;color:#e2e8f0}' +
      '[data-theme="dark"] header,[data-theme="dark"] footer{background:#1e293b}' +
      '[data-theme="dark"] .pro{background:#1e293b;border-color:#334155}' +
      '[data-theme="dark"] input,[data-theme="dark"] textarea{background:#1e293b;color:#e2e8f0;border-color:#475569}' +
      '.dark-mode-toggle{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-size:14px;transition:all .2s}' +
      '.dark-mode-toggle:hover{background:#f1f5f9}' +
      '[data-theme="dark"] .dark-mode-toggle{background:#1e293b;border-color:#475569;color:#e2e8f0}' +
      '[data-theme="dark"] .dark-mode-toggle:hover{background:#334155}';
    document.head.appendChild(s);
  }

  function createToggleButton() {
    if (document.querySelector('.dark-mode-toggle')) return;
    var btn = document.createElement('button');
    btn.className = 'dark-mode-toggle';
    btn.type = 'button';
    btn.innerHTML =
      '<span class="dm-icon"></span><span class="dm-label"></span>';
    btn.addEventListener('click', toggleTheme);

    var nav = document.querySelector('nav, .navbar, header');
    if (nav) nav.appendChild(btn);
    else document.body.appendChild(btn);
  }

  function init() {
    injectStyles();
    applyTheme(getEffectiveTheme());
    createToggleButton();

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        var stored = getStoredPreference();
        if (!stored) applyTheme(getSystemPreference());
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraDarkMode = {
    toggle: toggleTheme,
    setTheme: function (t) { storePreference(t); applyTheme(t); },
    getTheme: getEffectiveTheme,
  };
})();
