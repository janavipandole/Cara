/* global fetchWithTimeout */
const API_BASE_URL = window.CARA_API_BASE_URL || 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('registerSubmitBtn');
  const messageBox = document.getElementById('formMessage');

  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const rawUsername =
      document.getElementById('registerUsername')?.value || '';
    const rawEmail = document.getElementById('registerEmail')?.value || '';
    const username = window.CaraSanitize
      ? window.CaraSanitize.sanitizeInput(rawUsername)
      : rawUsername.trim();
    const email = window.CaraSanitize
      ? window.CaraSanitize.sanitizeInput(rawEmail)
      : rawEmail.trim();
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!username || !email || !password) {
      messageBox.innerText = 'All fields are required!';
      messageBox.style.color = 'red';
      return;
    }

    if (password.length < 8) {
      messageBox.innerText = 'Password must be at least 8 characters long!';
      messageBox.style.color = 'red';
      return;
    }

    const complexityRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!complexityRegex.test(password)) {
      messageBox.innerText =
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!';
      messageBox.style.color = 'red';
      return;
    }

    if (password !== confirmPassword) {
      messageBox.innerText = 'Passwords do not match!';
      messageBox.style.color = 'red';
      return;
    }

    try {
      const fetchFunc =
        typeof fetchWithTimeout === 'function' ? fetchWithTimeout : fetch;
      const res = await fetchFunc(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('cara_user_token', data.access_token);
      localStorage.setItem('cara_user_email', data.user.email);
      localStorage.setItem('cara_user_name', data.user.username);
      localStorage.setItem('cara_user_role', data.user.role);

      messageBox.style.color = 'green';
      messageBox.innerText = 'Account created successfully! Redirecting...';

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (err) {
      messageBox.style.color = 'red';
      messageBox.innerText = err.message;
    }
  });
});
