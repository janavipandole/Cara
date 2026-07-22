/* global fetchWithTimeout */
const API_BASE_URL = window.CARA_API_BASE_URL || 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('registerSubmitBtn');
  const messageBox = document.getElementById('formMessage');

  function setValidity(inputId, isValid, message) {
    var input = document.getElementById(inputId);
    var errorEl = input
      ? input.parentElement.querySelector('.error-message') ||
        document.getElementById(
          inputId.replace('register', '').toLowerCase() + 'ErrorReg',
        )
      : null;
    if (input) input.setAttribute('aria-invalid', String(!isValid));
    if (errorEl) errorEl.textContent = isValid ? '' : message;
  }

  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    var username = document.getElementById('registerUsername')?.value.trim();
    var email = document.getElementById('registerEmail')?.value.trim();
    if (
      typeof window !== 'undefined' &&
      typeof window.sanitizeHTML === 'function'
    ) {
      username = window.sanitizeHTML(username);
      email = window.sanitizeHTML(email);
    }
    var password = document.getElementById('registerPassword')?.value;
    var confirmPassword = document.getElementById('confirmPassword')?.value;

    setValidity('registerUsername', true, '');
    setValidity('registerEmail', true, '');
    setValidity('registerPassword', true, '');
    setValidity('confirmPassword', true, '');

    if (!username || !email || !password) {
      if (!username)
        setValidity('registerUsername', false, 'Full name is required.');
      if (!email) setValidity('registerEmail', false, 'Email is required.');
      if (!password)
        setValidity('registerPassword', false, 'Password is required.');
      messageBox.innerText = 'All fields are required!';
      messageBox.style.color = 'red';
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9.\\-_ ]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setValidity(
        'registerUsername',
        false,
        'Username must be 3-20 characters (letters, numbers, spaces, dots, hyphens, underscores).',
      );
      messageBox.innerText = 'Invalid username!';
      messageBox.style.color = 'red';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidity('registerEmail', false, 'Invalid email format.');
      messageBox.innerText = 'Invalid email address!';
      messageBox.style.color = 'red';
      return;
    }

    if (password.length < 8) {
      setValidity(
        'registerPassword',
        false,
        'Password must be at least 8 characters.',
      );
      messageBox.innerText = 'Password must be at least 8 characters long!';
      messageBox.style.color = 'red';
      return;
    }

    const complexityRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!complexityRegex.test(password)) {
      setValidity(
        'registerPassword',
        false,
        'Must include uppercase, lowercase, number & special character.',
      );
      messageBox.innerText =
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!';
      messageBox.style.color = 'red';
      return;
    }

    if (password !== confirmPassword) {
      setValidity('confirmPassword', false, 'Passwords do not match.');
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
      setValidity('registerUsername', false, '');
      setValidity('registerEmail', false, '');
      setValidity('registerPassword', false, '');
      setValidity('confirmPassword', false, '');
      messageBox.style.color = 'red';
      messageBox.innerText = err.message;
    }
  });
});
