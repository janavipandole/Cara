(function () {
  'use strict';
  const form = document.querySelector('[data-stock-notify-form]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]');
    if (!email || !email.value) return;
    try {
      const KEY = 'cara_restock_alerts';
      const list = JSON.parse(localStorage.getItem(KEY)) || [];
      list.push({ sku: form.getAttribute('data-stock-sku'), email: email.value, at: Date.now() });
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (err) {}
    const status = form.querySelector('[data-stock-notify-status]');
    if (status) status.textContent = 'You\'ll be notified when it\'s back in stock.';
    form.reset();
  });
})();
