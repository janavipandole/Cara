(function () {
  'use strict';
  const form = document.querySelector('[data-store-locator]');
  if (!form) return;
  const input = form.querySelector('input[type="text"]');
  const status = form.querySelector('[data-store-status]');
  if (!input || !status) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pincode = input.value.trim();
    if (!/^\d{6}$/.test(pincode)) {
      status.textContent = 'Please enter a valid 6-digit pincode.';
      return;
    }
    form.dispatchEvent(new CustomEvent('cara:locator-submit', { detail: { pincode } }));
  });
})();
