/* ===== RESET PASSWORD JS ===== */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('resetForm');
  if (!form) return;

  // The one-time reset token is carried in the URL query (?token=...), which
  // is the link delivered by the forgot-password email.
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get('token');

  const messageEl = document.getElementById('resetFormError');

  function setError(message) {
    if (!messageEl) return;
    messageEl.textContent = message || '';
  }

  if (!resetToken) {
    setError(
      'This reset link is invalid or expired. Please request a new one.',
    );
    return;
  }

  const toggleNewPass = document.getElementById('toggleResetNewPass');
  if (toggleNewPass) {
    toggleNewPass.addEventListener('click', function () {
      const pwd = document.getElementById('resetNewPass');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      this.classList.toggle('ri-eye-line');
      this.classList.toggle('ri-eye-off-line');
    });
  }

  const toggleConfirmPass = document.getElementById('toggleResetConfirmPass');
  if (toggleConfirmPass) {
    toggleConfirmPass.addEventListener('click', function () {
      const pwd = document.getElementById('resetConfirmPass');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      this.classList.toggle('ri-eye-line');
      this.classList.toggle('ri-eye-off-line');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setError('');

    const newPass = document.getElementById('resetNewPass').value;
    const confirmPass = document.getElementById('resetConfirmPass').value;

    /* validations — each check returns early so only one message shows at a time */
    if (!newPass) {
      showToast('Password is required.', 'warning');
      return;
    }

    if (/\s/.test(newPass)) {
      showToast('Password must not contain spaces.', 'warning');
      return;
    }

    if (newPass.length < 8) {
      showToast('Password must be at least 8 characters long.', 'warning');
      return;
    }

    if (!/[A-Z]/.test(newPass)) {
      showToast(
        'Password must contain at least one uppercase letter (A-Z).',
        'warning',
      );
      return;
    }

    if (!/[a-z]/.test(newPass)) {
      showToast(
        'Password must contain at least one lowercase letter (a-z).',
        'warning',
      );
      return;
    }

    if (!/[0-9]/.test(newPass)) {
      showToast(
        'Password must contain at least one number (0-9).',
        'warning',
      );
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPass)) {
      showToast(
        'Password must contain at least one special character (e.g. @, #, $).',
        'warning',
      );
      return;
    }

    if (newPass !== confirmPass) {
      showToast('Passwords do not match!', 'warning');
      return;
    }

    const submitBtn = form.querySelector(
      'button[type="submit"], .btn-primary',
    );
    if (submitBtn) {
      submitBtn.classList.add('btn-loading');
      submitBtn.disabled = true;
    }

    const API_BASE = window.CARA_API_BASE_URL || '';

    fetch(API_BASE + '/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, new_password: newPass }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (data) {
            throw new Error(data.detail || 'Reset failed');
          });
        }
        return res.json();
      })
      .then(function () {
        showToast(
          'Password reset successful! Redirecting to login...',
          'success',
        );
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 2000);
      })
      .catch(function (err) {
        console.warn('[ResetPassword] Failed:', err);
        showToast(err.message || 'Password reset failed', 'error');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.classList.remove('btn-loading');
          submitBtn.disabled = false;
        }
      });
  });
});
