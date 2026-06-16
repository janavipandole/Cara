// Session-bound checkout draft form saver
document.addEventListener('DOMContentLoaded', () => {
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
      const saved = sessionStorage.getItem(`cara_checkout_draft_${id}`);
      if (saved) el.value = saved;

      el.addEventListener('input', () => {
        sessionStorage.setItem(`cara_checkout_draft_${id}`, el.value);
      });
    }
  });

  form.addEventListener('submit', () => {
    fields.forEach((id) =>
      sessionStorage.removeItem(`cara_checkout_draft_${id}`)
    );
  });
});
