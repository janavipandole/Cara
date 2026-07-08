// Gift Wrapping Option Engine
document.addEventListener('DOMContentLoaded', () => {
  const giftCheckbox = document.getElementById('gift-wrap-opt');
  const giftMsgArea = document.getElementById('gift-msg-wrap');

  if (!giftCheckbox) return;

  // Toggle message area
  giftCheckbox.addEventListener('change', () => {
    if (giftCheckbox.checked) {
      if (giftMsgArea) giftMsgArea.style.display = 'block';
    } else {
      if (giftMsgArea) giftMsgArea.style.display = 'none';
    }

    // Trigger centralized checkout summary update
    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  });
});
