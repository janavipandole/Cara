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
document.getElementById('forgotForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email       = document.getElementById('forgotEmail').value.trim();
  const newPass     = document.getElementById('forgotNewPass').value;
  const confirmPass = document.getElementById('forgotConfirmPass').value;

  /* validations */
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email!', 'warning');
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!newPass || !passwordRegex.test(newPass)) {
    showToast('Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.', 'warning');
    return;
  }

  if (newPass !== confirmPass) {
    showToast('Passwords do not match!', 'warning');
    return;
  }

  /* ── Loading state: disable button & show spinner ── */
  const submitBtn = document.querySelector('#forgotForm button[type="submit"], #forgotForm .btn-primary');
  if (submitBtn) {
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
  }

  /* check if email exists in localStorage */
  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    showToast('No account found with this email!', 'error');
    if (submitBtn) {
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }
    return;
  }

  /* hash new password before storing */
  users[userIndex].password = await hashPassword(newPass);
  localStorage.setItem('users', JSON.stringify(users));

  if (submitBtn) {
    submitBtn.classList.remove('btn-loading');
    submitBtn.disabled = false;
  }

  showToast('Password reset successful! Redirecting to login...', 'success');

  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
});
