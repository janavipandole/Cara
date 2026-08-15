(function () {
  'use strict';
  const container = document.getElementById('cara-notif-container');
  if (!container) return;
  container.setAttribute('role', 'region');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
})();
