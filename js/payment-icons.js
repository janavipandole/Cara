(function () {
  'use strict';
  const el = document.querySelector('[data-payment-methods]');
  if (!el) return;
  const methods = (el.getAttribute('data-payment-methods') || 'upi,cod').split(',');
  methods.forEach((m) => {
    const badge = document.createElement('span');
    badge.className = 'cara-payment-badge';
    badge.textContent = m.trim().toUpperCase();
    el.appendChild(badge);
  });
})();
