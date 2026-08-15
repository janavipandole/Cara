(function () {
  'use strict';
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  const KEY = 'cara_theme';
  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
  };
  const saved = (() => { try { return localStorage.getItem(KEY); } catch (e) { return null; } })();
  const initial = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  apply(initial);
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });
})();
