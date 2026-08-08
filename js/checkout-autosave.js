// Session-bound checkout draft form saver

export function saveDraftField(id, value) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(`cara_checkout_draft_${id}`, value);
  } catch (e) {
    // Ignore storage failures in restricted environments.
  }
}

export function getDraftField(id) {
  if (typeof sessionStorage === 'undefined') return '';
  try {
    return sessionStorage.getItem(`cara_checkout_draft_${id}`) || '';
  } catch (e) {
    return '';
  }
}

export function clearCheckoutDraft(fields = []) {
  if (typeof sessionStorage === 'undefined') return;
  fields.forEach((id) => {
    try {
      sessionStorage.removeItem(`cara_checkout_draft_${id}`);
    } catch (e) {
      // Ignore storage failures in restricted environments.
    }
  });
}

export function initCheckoutAutosave(fieldIds) {
  if (typeof document === 'undefined') return;
  const form = document.querySelector('form');
  if (!form) return;

  const fields = fieldIds || [
    'checkout-firstname',
    'checkout-lastname',
    'checkout-address',
    'checkout-zip',
    'checkout-phone',
  ];

  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const saved = getDraftField(id);
      if (saved) el.value = saved;

      el.addEventListener('input', () => {
        saveDraftField(id, el.value);
      });
    }
  });

  form.addEventListener('submit', () => {
    clearCheckoutDraft(fields);
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCheckoutAutosave);
}



export function getDebounceDelayMs() { return 500; }