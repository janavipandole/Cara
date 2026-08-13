(function () {
  'use strict';
  document.querySelectorAll('[data-review-summary]').forEach((el) => {
    const counts = [0, 0, 0, 0, 0];
    const reviews = el.querySelectorAll('[data-review-rating]');
    reviews.forEach((r) => {
      const val = parseInt(r.getAttribute('data-review-rating'), 10);
      if (val >= 1 && val <= 5) counts[val - 1] += 1;
    });
    const total = counts.reduce((a, b) => a + b, 0);
    if (!total) return;
    const avg = (counts.reduce((acc, c, i) => acc + c * (i + 1), 0) / total).toFixed(1);
    const avgEl = el.querySelector('[data-avg-rating]');
    if (avgEl) avgEl.textContent = avg;
    counts.forEach((c, i) => {
      const bar = el.querySelector('[data-bar-star="' + (i + 1) + '"]');
      if (bar) bar.style.width = Math.round((c / total) * 100) + '%';
    });
  });
})();
