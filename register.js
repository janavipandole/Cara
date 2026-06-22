/* global showToast, fetchWithTimeout */
document.addEventListener('DOMContentLoaded', function () {
  const submitBtn = document.getElementById('registerSubmitBtn');
  const nameInput = document.getElementById('registerUsername');
  const emailInput = document.getElementById('registerEmail');
  const passwordInput = document.getElementById('registerPassword');
  const confirmInput = document.getElementById('confirmPassword');
  const confirmHint = document.getElementById('confirmHint');

  // Helper functions for UI feedback
  function showToastMsg(message, type) {
    if (typeof showToast === 'function') {
      showToast(message, type);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 400);
    }, 3000);
  }

  function showFieldError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');

    let errorSpan = inputEl.parentElement.querySelector('.error-message');
    if (!errorSpan) {
      const group = inputEl.closest('.form-group');
      if (group) errorSpan = group.querySelector('.error-message');
    }
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  function clearFieldError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');
    const group = inputEl.closest('.form-group');
    if (group) {
      const errorSpan = group.querySelector('.error-message');
      if (errorSpan) errorSpan.textContent = '';
    }
  }

  function clearAllErrors() {
    [nameInput, emailInput, passwordInput, confirmInput].forEach(function (el) {
      if (el) clearFieldError(el);
    });
    const msg = document.getElementById('formMessage');
    if (msg) msg.textContent = '';
  }

  // Passwords match dynamic hint
  if (confirmInput && confirmHint) {
    confirmInput.addEventListener('input', function () {
      if (confirmInput.value === '') {
        confirmHint.textContent = '';
        confirmHint.style.color = '';
        return;
      }
      if (confirmInput.value === passwordInput.value) {
        confirmHint.textContent = 'Passwords match ✓';
        confirmHint.style.color = '#28a745';
        confirmInput.classList.add('is-valid');
        confirmInput.classList.remove('is-invalid');
      } else {
        confirmHint.textContent = 'Passwords do not match';
        confirmHint.style.color = '#dc3545';
        confirmInput.classList.remove('is-valid');
        confirmInput.classList.add('is-invalid');
      }
    });
  }

  // Password visibility toggles
  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      const icon = document.getElementById('registerToggleIcon');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (icon) icon.className = 'ri-eye-off-line';
      } else {
        passwordInput.type = 'password';
        if (icon) icon.className = 'ri-eye-line';
      }
    });
  }

  const confirmToggle = document.getElementById('confirmTogglePassword');
  if (confirmToggle) {
    confirmToggle.addEventListener('click', function () {
      const icon = document.getElementById('confirmToggleIcon');
      if (confirmInput.type === 'password') {
        confirmInput.type = 'text';
        if (icon) icon.className = 'ri-eye-off-line';
      } else {
        confirmInput.type = 'password';
        if (icon) icon.className = 'ri-eye-line';
      }
    });
  }

  // Form submit
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    clearAllErrors();

    const username = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPwd = confirmInput ? confirmInput.value : '';
    const messageBox = document.getElementById('formMessage');

    let hasError = false;

    if (!username) { showFieldError(nameInput, 'Full name is required.'); hasError = true; }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError(emailInput, 'Email address is required.'); hasError = true;
    } else if (!emailRegex.test(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.'); hasError = true;
    }

    if (!password) {
      showFieldError(passwordInput, 'Password is required.'); hasError = true;
    } else if (password.length < 8) {
      showFieldError(passwordInput, 'Password must be at least 8 characters.'); hasError = true;
    } else {
      const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!complexityRegex.test(password)) {
        showFieldError(passwordInput, 'Password must contain at least one uppercase, lowercase, number, and special character!');
        hasError = true;
      }
    }

    if (!confirmPwd) {
      showFieldError(confirmInput, 'Please confirm your password.'); hasError = true;
    } else if (password && confirmPwd !== password) {
      showFieldError(confirmInput, 'Passwords do not match.'); hasError = true;
    }

    if (hasError) {
      if (messageBox) {
        messageBox.innerText = 'Please fix the errors above.';
        messageBox.style.color = 'red';
      }
      return;
    }

    try {
      submitBtn.disabled = true;
      if (messageBox) {
        messageBox.innerText = 'Creating account...';
        messageBox.style.color = '#333';
      }

      const fetchFunc = typeof fetchWithTimeout === 'function' ? fetchWithTimeout : fetch;
      
      const res = await fetchFunc('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      // Token is now set as an HttpOnly cookie automatically by the backend
      localStorage.setItem('user', JSON.stringify(data.user));

      if (messageBox) {
        messageBox.style.color = 'green';
        messageBox.innerText = 'Account created successfully! Redirecting...';
      }
      showToastMsg('Account created successfully! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);

    } catch (err) {
      console.error('Registration Error:', err);
      if (messageBox) {
        messageBox.style.color = 'red';
        messageBox.innerText = err.message;
      }
      showToastMsg(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
