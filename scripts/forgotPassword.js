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

      const email = document.getElementById('forgotEmail').value.trim();
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
          'warning'
        );
        return;
      }

      if (!/[a-z]/.test(newPass)) {
        showToast(
          'Password must contain at least one lowercase letter (a-z).',
          'warning'
        );
        return;
      }

      if (!/[0-9]/.test(newPass)) {
        showToast(
          'Password must contain at least one number (0-9).',
          'warning'
        );
        return;
      }

      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPass)) {
        showToast(
          'Password must contain at least one special character (e.g. @, #, $).',
          'warning'
        );
        return;
      }

      if (newPass !== confirmPass) {
        showToast('Passwords do not match!', 'warning');
        return;
      }

      /* ── Loading state: disable button & show spinner ── */
      const submitBtn = document.querySelector(
        '#forgotForm button[type="submit"], #forgotForm .btn-primary'
      );
      if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
      }

      /* Simulate async request */
      setTimeout(function () {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u) => u.email === email);

        if (userIndex === -1) {
          showToast('No account found with this email!', 'error');
          if (submitBtn) {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
          }
          return;
        }

        users[userIndex].password = newPass;
        localStorage.setItem('users', JSON.stringify(users));

        showToast(
          'Password reset successful! Redirecting to login...',
          'success'
        );

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      }, 1500);
    });
});
