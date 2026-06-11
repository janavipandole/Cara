// Loyalty Points Management System
document.addEventListener('DOMContentLoaded', () => {
  const balanceEl = document.getElementById('loyalty-balance');
  const earnEl = document.getElementById('points-to-earn');
  const pointsInput = document.getElementById('points-to-apply');
  const applyBtn = document.getElementById('apply-points-btn');
  const msgEl = document.getElementById('loyalty-msg');
  const totalEl = document.getElementById('summary-total');
  const discountRow = document.getElementById('summary-discount-row');
  const discountVal = document.getElementById('summary-discount');

  if (!balanceEl) return;

  // Load initial balance (mock 150 points for demo)
  let currentBalance =
    parseInt(localStorage.getItem('cara_loyalty_balance')) || 150;
  balanceEl.textContent = currentBalance;

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
    const pointsToUse = parseInt(pointsInput.value) || 0;
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
    msgEl.textContent = `Applied ${pointsToUse} points! Saved ₹${discountAmount.toFixed(2)}`;
    msgEl.style.color = '#088178';

    // Update display subtotal / discount
    if (discountRow && discountVal && totalEl) {
      discountRow.style.display = 'flex';
      discountVal.textContent = '-₹' + discountAmount.toFixed(2);

      const subtotalText = document
        .getElementById('summary-subtotal')
        .textContent.replace(/[^\d.]/g, '');
      const subtotal = parseFloat(subtotalText) || 0;
      const taxText =
        document
          .getElementById('summary-tax')
          ?.textContent.replace(/[^\d.]/g, '') || '0';
      const tax = parseFloat(taxText) || 0;

      const newTotal = Math.max(0, subtotal + tax - discountAmount);
      totalEl.textContent = '₹' + newTotal.toFixed(2);
    }
  });
});
