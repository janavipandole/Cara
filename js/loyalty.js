// Loyalty Points Management System
document.addEventListener('DOMContentLoaded', () => {
  const balanceEl = document.getElementById('loyalty-balance');
  const earnEl = document.getElementById('points-to-earn');
  const pointsInput = document.getElementById('points-to-apply');
  const applyBtn = document.getElementById('apply-points-btn');
  const msgEl = document.getElementById('loyalty-msg');

  if (!balanceEl) return;

  // Load initial balance (mock 150 points for demo)
  const currentBalance =
    parseInt(localStorage.getItem('cara_loyalty_balance'), 10) || 150;
  if (!localStorage.getItem('cara_loyalty_balance')) {
    localStorage.setItem('cara_loyalty_balance', '150');
  }
  balanceEl.textContent = currentBalance;

  // Pre-populate if points were already applied
  const preAppliedPoints =
    parseInt(localStorage.getItem('cara_applied_loyalty_points'), 10) || 0;
  if (preAppliedPoints > 0) {
    if (pointsInput) pointsInput.value = preAppliedPoints;
    if (msgEl) {
      msgEl.textContent = `Applied ${preAppliedPoints} points! Saved ₹${(
        preAppliedPoints * 0.1
      ).toFixed(2)}`;
      msgEl.style.color = '#088178';
    }
  }

  // Calculate points to earn from subtotal
  const updateEarnedPoints = () => {
    const subtotalText =
      document.getElementById('summary-subtotal')?.textContent || '0';
    const subtotal = parseFloat(subtotalText.replace(/[^\d.]/g, '')) || 0;
    const pointsToEarn = Math.floor(subtotal * 0.1); // 10% back in points
    if (earnEl) earnEl.textContent = pointsToEarn;
  };

  // Observer to re-calculate when subtotal updates
  const observer = new MutationObserver(updateEarnedPoints);
  const subtotalEl = document.getElementById('summary-subtotal');
  if (subtotalEl) {
    observer.observe(subtotalEl, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    updateEarnedPoints();
  }

  applyBtn?.addEventListener('click', () => {
    const pointsToUse = parseInt(pointsInput.value, 10) || 0;
    if (pointsToUse <= 0) {
      msgEl.textContent = 'Please enter a valid amount of points.';
      msgEl.style.color = '#ef4444';
      return;
    }
    if (pointsToUse > currentBalance) {
      msgEl.textContent = 'Insufficient points balance.';
      msgEl.style.color = '#ef4444';
      return;
    }

    const discountAmount = pointsToUse * 0.1; // 10 points = ₹1
    msgEl.textContent = `Applied ${pointsToUse} points! Saved ₹${discountAmount.toFixed(
      2
    )}`;
    msgEl.style.color = '#088178';

    // Store points in localStorage and trigger summary update
    localStorage.setItem('cara_applied_loyalty_points', String(pointsToUse));
    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  });
});
