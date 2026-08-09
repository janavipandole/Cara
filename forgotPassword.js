/* ===== FORGOT PASSWORD JS ===== */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('forgotForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailInput = document.getElementById('forgotEmail');
    const email = (emailInput.value || '').trim();
    const messageEl = document.getElementById('forgotMessage');
    const errorEl = document.getElementById('forgotEmailError');

    if (messageEl) messageEl.textContent = '';
    if (errorEl) errorEl.textContent = '';

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email!', 'warning');
      return;
    }

    const submitBtn = document.querySelector(
      '#forgotForm button[type="submit"], #forgotForm .btn-primary',
    );
    if (submitBtn) {
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
    }

    const API_BASE = window.CARA_API_BASE_URL || '';

    fetch(API_BASE + '/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (data) {
            throw new Error(data.detail || 'Request failed');
          });
        }
        return res.json();
      })
      .then(function (data) {
        // The backend never returns the reset token — it is delivered via the
        // reset link in the email. Show the confirmation message only.
        const msg =
          data.message || 'If the email exists, a reset link has been sent.';
        if (messageEl) messageEl.textContent = msg;
        showToast(msg, 'success');
        emailInput.value = '';
      })
      .catch(function (err) {
        console.warn('[ForgotPassword] Failed:', err);
        showToast(err.message || 'Request failed', 'error');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.classList.remove('btn-loading');
          submitBtn.disabled = false;
        }
      });
  });
});
