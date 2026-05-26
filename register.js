const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!username || !email || !password || !confirmPassword) {
    showError('Please fill in all fields.');
    return;
  }

  if (/\s/.test(password)) {
    showError('Password must not contain spaces.');
    return;
  }

  if (password.length < 8) {
    showError('Password must be at least 8 characters long.');
    return;
  }

  if (!/[A-Z]/.test(password)) {
    showError('Password must contain at least one uppercase letter (A-Z).');
    return;
  }

  if (!/[a-z]/.test(password)) {
    showError('Password must contain at least one lowercase letter (a-z).');
    return;
  }

  if (!/[0-9]/.test(password)) {
    showError('Password must contain at least one number (0-9).');
    return;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    showError(
      'Password must contain at least one special character (e.g. @, #, $).'
    );
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match.');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  const emailAlreadyExists = users.find((u) => u.email === email);
  if (emailAlreadyExists) {
    showError('An account with this email already exists.');
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem('users', JSON.stringify(users));

  showSuccess('Account created successfully! Redirecting to login...');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
});

document
  .getElementById('registerPassword')
  .addEventListener('input', function () {
    const val = this.value;
    const hint = document.getElementById('passwordHint');
    if (!hint) return;

    if (/\s/.test(val)) {
      hint.textContent = '✗ Spaces are not allowed in the password.';
      hint.style.color = '#e74c3c';
    } else if (val.length === 0) {
      hint.textContent = '';
    } else {
      const checks = [
        { pass: val.length >= 8, msg: '8+ characters' },
        { pass: /[A-Z]/.test(val), msg: 'uppercase letter' },
        { pass: /[a-z]/.test(val), msg: 'lowercase letter' },
        { pass: /[0-9]/.test(val), msg: 'number' },
        {
          pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val),
          msg: 'special character',
        },
      ];

      const missing = checks.filter((c) => !c.pass).map((c) => c.msg);

      if (missing.length === 0) {
        hint.textContent = '✓ Strong password!';
        hint.style.color = '#27ae60';
      } else {
        hint.textContent = 'Missing: ' + missing.join(', ');
        hint.style.color = '#e67e22';
      }
    }
  });

function showError(msg) {
  const existing = document.getElementById('formMessage');
  if (existing) existing.remove();

  const el = document.createElement('p');
  el.id = 'formMessage';
  el.textContent = msg;
  el.style.cssText =
    'color:#e74c3c; font-size:13px; margin-top:10px; text-align:center;';
  registerForm.appendChild(el);
}

function showSuccess(msg) {
  const existing = document.getElementById('formMessage');
  if (existing) existing.remove();

  const el = document.createElement('p');
  el.id = 'formMessage';
  el.textContent = msg;
  el.style.cssText =
    'color:#27ae60; font-size:13px; margin-top:10px; text-align:center;';
  registerForm.appendChild(el);
}
