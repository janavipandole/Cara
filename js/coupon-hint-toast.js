(function () {
  'use strict';
  const params = new URLSearchParams(location.search);
  const code = params.get('coupon') || params.get('promo');
  if (!code) return;
  const field = document.querySelector('[data-coupon-input]');
  if (field && !field.value) {
    field.value = code;
    field.dispatchEvent(new Event('input'));
    window.dispatchEvent(new CustomEvent('cara:notify', {
      detail: { message: 'Coupon applied: ' + code.toUpperCase(), type: 'success' },
    }));
  }
})();
