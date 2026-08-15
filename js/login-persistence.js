(function () {
  'use strict';
  const endpoint = document.body.getAttribute('data-auth-refresh-url');
  if (!endpoint) return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    fetch(endpoint, { method: 'POST', credentials: 'include' }).catch(() => {});
  });
})();
