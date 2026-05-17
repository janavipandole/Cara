/* ===== FORGOT PASSWORD JS ===== */

/* toggle new password visibility */
document.getElementById('toggleNewPass').addEventListener('click', function () {
  const pwd = document.getElementById('forgotNewPass');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
  this.classList.toggle('ri-eye-line');
  this.classList.toggle('ri-eye-off-line');
});

/* toggle confirm password visibility */
document.getElementById('toggleConfirmPass').addEventListener('click', function () {
  const pwd = document.getElementById('forgotConfirmPass');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
  this.classList.toggle('ri-eye-line');
  this.classList.toggle('ri-eye-off-line');
});

/* form submit */
document.getElementById('forgotForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const email       = document.getElementById('forgotEmail').value.trim();
  const newPass     = document.getElementById('forgotNewPass').value;
  const confirmPass = document.getElementById('forgotConfirmPass').value;

  /* validations */
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email!', 'warning');
    return;
  }

  if (!newPass || newPass.length < 6) {
    showToast('Password must be at least 6 characters!', 'warning');
    return;
  }

  if (newPass !== confirmPass) {
    showToast('Passwords do not match!', 'warning');
    return;
  }

  /* check if email exists in localStorage */
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    showToast('No account found with this email!', 'error');
    return;
  }

  /* update password */
  users[userIndex].password = newPass;
  localStorage.setItem('users', JSON.stringify(users));

  showToast('Password reset successful! Redirecting to login...', 'success');

  /* redirect to login after success */
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
});

/* toast function — self-contained for pages that don't load app.js */
if (typeof showToast === 'undefined') {
    function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        var icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.innerHTML =
            '<i class="fa-solid ' + (icons[type] || icons.success) + ' toast-icon"></i>' +
            '<span class="toast-msg">' + message + '</span>' +
            '<button class="toast-close" aria-label="Close notification">&times;</button>' +
            '<div class="toast-progress"></div>';
        toast.querySelector('.toast-close').addEventListener('click', function () {
            dismissToast(toast);
        });
        container.appendChild(toast);
        setTimeout(function () { dismissToast(toast); }, 4000);
    }

    function dismissToast(toast) {
        if (!toast || toast.classList.contains('toast-hiding')) return;
        toast.classList.add('toast-hiding');
        toast.addEventListener('animationend', function () { toast.remove(); });
    }
}