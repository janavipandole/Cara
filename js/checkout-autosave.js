// Session-bound checkout draft form saver

export function saveDraftField(id, value) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(`cara_checkout_draft_${id}`, value);
  }
}

export function getDraftField(id) {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(`cara_checkout_draft_${id}`) || '';
  }
  return '';
}

export function clearCheckoutDraft(fields = []) {
  if (typeof sessionStorage === 'undefined') return;
  fields.forEach((id) => sessionStorage.removeItem(`cara_checkout_draft_${id}`));
}

export function initCheckoutAutosave() {
  if (typeof document === 'undefined') return;
  const form = document.querySelector('form');
  if (!form) return;

  const fields = [
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
