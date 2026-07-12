// Checkout Promo Count Down Timer
document.addEventListener('DOMContentLoaded', () => {
  const totalEl = document.getElementById('summary-total');
  if (!totalEl) return;

  // Inject Urgency Bar at the top of checkout content
  const checkoutHeader =
    document.querySelector('.checkout-container') || document.body;
  const alertBar = document.createElement('div');
  alertBar.id = 'checkout-promo-alert-bar';
  alertBar.style.cssText =
    'background: #e23e57; color: white; padding: 12px; text-align: center; font-weight: 700; font-family: sans-serif; font-size: 14px; margin-bottom: 20px; border-radius: 6px; animation: pulse 2s infinite;';
  alertBar.innerHTML = `<i class="ri-timer-line"></i> Limited Offer! Checkout in <span id="checkout-timer">15:00</span> to save an extra 5% discount on checkout total!`;

  checkoutHeader.parentNode.insertBefore(alertBar, checkoutHeader);

  let minutes = 15;
  let seconds = 0;
  window.urgencyTimerExpired = false;

  const timerInterval = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(timerInterval);
        window.urgencyTimerExpired = true;
        expirePromo();
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

  const applyUrgencyDiscount = () => {
    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  };

  // Auto-calculate on start
  setTimeout(applyUrgencyDiscount, 800);

  function expirePromo() {
    const bar = document.getElementById('checkout-promo-alert-bar');
    if (bar) {
      bar.style.background = '#7f8c8d';
      bar.innerHTML = `<i class="ri-error-warning-line"></i> Urgency promotional offer has expired.`;
    }

    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  }
});
