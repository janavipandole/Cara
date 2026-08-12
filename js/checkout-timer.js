// Checkout Promo & Inventory Reservation Hold Timer Module
document.addEventListener('DOMContentLoaded', async () => {
  const totalEl = document.getElementById('summary-total');
  if (!totalEl) return;

  const checkoutHeader = document.querySelector('.checkout-container') || document.body;
  const alertBar = document.createElement('div');
  alertBar.id = 'checkout-promo-alert-bar';
  alertBar.style.cssText =
    'background: #088178; color: white; padding: 12px; text-align: center; font-weight: 700; font-family: sans-serif; font-size: 14px; margin-bottom: 20px; border-radius: 6px; box-shadow: 0 4px 15px rgba(8,129,120,0.3);';
  alertBar.innerHTML = `<i class="ri-lock-line"></i> Stock Reserved! Complete checkout in <span id="checkout-timer">10:00</span> to lock your items!`;

  if (checkoutHeader && checkoutHeader.parentNode) {
    checkoutHeader.parentNode.insertBefore(alertBar, checkoutHeader);
  }

  // Trigger backend inventory hold reservation
  try {
    const apiBaseUrl = window.CARA_API_BASE_URL || '';
    const fetchFunc = typeof window.fetchWithTimeout === 'function' ? window.fetchWithTimeout : fetch;
    const sessionId = 'session_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9));

    await fetchFunc(`${apiBaseUrl}/api/inventory/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        product_id: 1,
        quantity: 1,
        session_id: sessionId,
        hold_minutes: 10,
      }),
    });
  } catch (e) {
    // ignore reservation call error if API offline
  }

  let minutes = 10;
  let seconds = 0;
  window.urgencyTimerExpired = false;

  const timerInterval = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timerInterval);
        window.urgencyTimerExpired = true;
        expirePromo();
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('checkout-timer-expired'));
        }
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }

    const secStr = seconds < 10 ? '0' + seconds : seconds;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    const timerEl = document.getElementById('checkout-timer');
    if (timerEl) timerEl.textContent = `${minStr}:${secStr}`;
  }, 1000);

  function expirePromo() {
    const bar = document.getElementById('checkout-promo-alert-bar');
    if (bar) {
      bar.style.background = '#e23e57';
      bar.innerHTML = `<i class="ri-error-warning-line"></i> Stock reservation expired. Please refresh checkout to reserve items.`;
    }
  }
});
