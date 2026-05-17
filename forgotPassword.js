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
    showToast('⚠️ Please enter a valid email!', true);
    return;
  }

  if (!newPass || newPass.length < 6) {
    showToast('⚠️ Password must be at least 6 characters!', true);
    return;
  }

  if (newPass !== confirmPass) {
    showToast('⚠️ Passwords do not match!', true);
    return;
  }

  /* check if email exists in localStorage */
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    showToast('⚠️ No account found with this email!', true);
    return;
  }

  /* update password */
  users[userIndex].password = newPass;
  localStorage.setItem('users', JSON.stringify(users));

  showToast('✅ Password reset successful! Redirecting to login...');

  /* redirect to login after success */
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
});

/* toast */
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.background = isError ? '#dc2626' : '#088178';
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
