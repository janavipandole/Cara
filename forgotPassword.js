/* ===== FORGOT PASSWORD JS ===== */

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('forgotForm')) return;

  const toggleNewPass = document.getElementById('toggleNewPass');
  if (toggleNewPass) {
    toggleNewPass.addEventListener('click', function () {
      const pwd = document.getElementById('forgotNewPass');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      this.classList.toggle('ri-eye-line');
      this.classList.toggle('ri-eye-off-line');
    });
  }

  const toggleConfirmPass = document.getElementById('toggleConfirmPass');
  if (toggleConfirmPass) {
    toggleConfirmPass.addEventListener('click', function () {
      const pwd = document.getElementById('forgotConfirmPass');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
      this.classList.toggle('ri-eye-line');
      this.classList.toggle('ri-eye-off-line');
    });
  }

  document
    .getElementById('forgotForm')
    .addEventListener('submit', function (e) {
      e.preventDefault();

      let email = document.getElementById('forgotEmail').value.trim();
      if (
        typeof window !== 'undefined' &&
        typeof window.sanitizeHTML === 'function'
      ) {
        email = window.sanitizeHTML(email);
      }
      const newPass = document.getElementById('forgotNewPass').value;
      const confirmPass = document.getElementById('forgotConfirmPass').value;

      /* validations — each check returns early so only one message shows at a time */
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email!', 'warning');
        return;
      }

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

      const submitBtn = document.querySelector(
        '#forgotForm button[type="submit"], #forgotForm .btn-primary',
      );
      if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
      }

      const API_BASE = window.CARA_API_BASE_URL || 'http://127.0.0.1:8000';

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
          var resetToken = data.reset_token;

          return fetch(API_BASE + '/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: resetToken,
              new_password: newPass,
            }),
          });
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
