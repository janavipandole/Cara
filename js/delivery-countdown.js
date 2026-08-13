(function () {
  'use strict';
  const el = document.getElementById('cara-delivery-countdown');
  if (!el) return;
  const cutoff = el.getAttribute('data-cutoff') || '18:00';
  const tick = () => {
    const now = new Date();
    const [h, m] = cutoff.split(':').map(Number);
    const cutoffTime = new Date(now);
    cutoffTime.setHours(h, m, 0, 0);
    const diff = cutoffTime.getTime() - now.getTime();
    if (diff <= 0) {
      el.textContent = 'Order now for tomorrow\'s dispatch.';
      return;
    }
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    el.textContent = 'Order within ' + mins + 'm ' + secs + 's for next-day delivery';
  };
  tick();
  setInterval(tick, 1000);
})();
