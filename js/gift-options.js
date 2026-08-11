// Gift Wrapping Option Engine
document.addEventListener('DOMContentLoaded', () => {
  const giftCheckbox = document.getElementById('gift-wrap-opt');
  const giftMsgArea = document.getElementById('gift-msg-wrap');

  if (!giftCheckbox) return;

  const STORAGE_KEY = 'cara_gift_wrap';

  // Restore the saved gift wrap choice so it survives page reloads.
  let saved = false;
  try {
    saved = localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {
    // Ignore storage failures in restricted environments.
  }
  giftCheckbox.checked = saved;
  if (giftMsgArea) giftMsgArea.style.display = saved ? 'block' : 'none';

  // Toggle message area
  giftCheckbox.addEventListener('change', () => {
    const checked = giftCheckbox.checked;
    if (giftMsgArea) giftMsgArea.style.display = checked ? 'block' : 'none';

    try {
      localStorage.setItem(STORAGE_KEY, checked ? '1' : '0');
    } catch (e) {
      // Ignore storage failures in restricted environments.
    }

    // Trigger centralized checkout summary update
    if (typeof window.updateCheckoutSummary === 'function') {
      window.updateCheckoutSummary();
    }
  });

  // Wire up gift message validation to the textarea
  const giftMsgInput = giftMsgArea ? giftMsgArea.querySelector('textarea') : null;
  const MAX_GIFT_MSG_LENGTH = 500;
  if (giftMsgInput) {
    giftMsgInput.setAttribute('maxlength', String(MAX_GIFT_MSG_LENGTH));
    const counter = document.createElement('span');
    counter.style.cssText = 'font-size:11px; color:#888; display:block; text-align:right;';
    counter.textContent = `0/${MAX_GIFT_MSG_LENGTH}`;
    giftMsgInput.parentNode.appendChild(counter);
    giftMsgInput.addEventListener('input', function() {
      counter.textContent = `${giftMsgInput.value.length}/${MAX_GIFT_MSG_LENGTH}`;
    });
  }
  if (giftMsgInput) {
    giftMsgInput.addEventListener('input', () => {
      const valid = validateGiftMessageLength(giftMsgInput.value, 200);
      if (!valid) {
        giftMsgInput.setCustomValidity('Gift message exceeds the 200-character limit.');
        giftMsgInput.reportValidity();
      } else {
        giftMsgInput.setCustomValidity('');
      }
    });
  }

  // Expose utility function globally for external use
  window.validateGiftMessageLength = validateGiftMessageLength;
});


function validateGiftMessageLength(message, maxChars = 200) { if (!message || typeof message !== 'string') return true; return message.trim().length <= maxChars; }

export function getGiftOptionsStatusHelper33() {
  return { status: "ok", fn: "getGiftOptionsStatusHelper33" };
}
