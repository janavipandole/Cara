document.addEventListener('DOMContentLoaded', function () {
  const submitBtn = document.getElementById('registerSubmitBtn');
  const nameInput = document.getElementById('registerUsername');
  const emailInput = document.getElementById('registerEmail');
  const passwordInput = document.getElementById('registerPassword');
  const confirmInput = document.getElementById('confirmPassword');
  const confirmHint = document.getElementById('confirmHint');

  // ============================================================
  // HELPER: show a toast notification (same function as login.js)
  // type = 'success' | 'error'
  // ============================================================
  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('show');
    }, 10);

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 3000);
  }

  // ============================================================
  // HELPER: show an inline error under a field
  // ============================================================
  function showFieldError(inputEl, message) {
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');

    // look for the next sibling <span class="error-message">
    // if it doesn't exist yet, create one right after the input (or its wrapper)
    let errorSpan = inputEl.parentElement.querySelector('.error-message');
    if (!errorSpan) {
      // input might be inside a .password-wrapper, so go up one more level
      errorSpan = inputEl
        .closest('.form-group')
        .querySelector('.error-message');
    }
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  // ============================================================
  // HELPER: clear a field's error state
  // ============================================================
  function clearFieldError(inputEl) {
    inputEl.classList.remove('is-invalid');
    const group = inputEl.closest('.form-group');
    if (group) {
      const errorSpan = group.querySelector('.error-message');
      if (errorSpan) errorSpan.textContent = '';
    }
  }

  // ============================================================
  // HELPER: clear ALL field errors
  // ============================================================
  function clearAllErrors() {
    [nameInput, emailInput, passwordInput, confirmInput].forEach(function (el) {
      if (el) clearFieldError(el);
    });
    // also clear the old formMessage div if it's being used
    const msg = document.getElementById('formMessage');
    if (msg) msg.textContent = '';
  }

  // ============================================================
  // LIVE confirm-password hint
  // Shows "Passwords match ✓" or "Passwords do not match" as they type.
  // ============================================================
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

  // ============================================================
  // PASSWORD TOGGLE — main password field
  // ============================================================
  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      const icon = document.getElementById('registerToggleIcon');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'ri-eye-off-line';
      } else {
        passwordInput.type = 'password';
        icon.className = 'ri-eye-line';
      }
    });
  }

  // ============================================================
  // PASSWORD TOGGLE — confirm password field
  // ============================================================
  const confirmToggle = document.getElementById('confirmTogglePassword');
  if (confirmToggle) {
    confirmToggle.addEventListener('click', function () {
      const icon = document.getElementById('confirmToggleIcon');
      if (confirmInput.type === 'password') {
        confirmInput.type = 'text';
        icon.className = 'ri-eye-off-line';
      } else {
        confirmInput.type = 'password';
        icon.className = 'ri-eye-line';
      }
    });
  }

  // ============================================================
  // FORM SUBMIT
  // ============================================================
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function (e) {
    e.preventDefault();
    clearAllErrors(); // wipe previous errors first

    const fullName = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    const confirmPwd = confirmInput ? confirmInput.value : '';

    // collect checked interests
    const interests = [];
    document
      .querySelectorAll('input[name="interest"]:checked')
      .forEach(function (cb) {
        interests.push(cb.value);
      });

    // --- INLINE VALIDATION ---
    let hasError = false;

    if (!fullName) {
      showFieldError(nameInput, 'Full name is required.');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError(emailInput, 'Email address is required.');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      showFieldError(passwordInput, 'Password is required.');
      hasError = true;
    } else if (password.length < 8) {
      showFieldError(passwordInput, 'Password must be at least 8 characters.');
      hasError = true;
    } else if (!/\d/.test(password)) {
      showFieldError(
        passwordInput,
        'Password must include at least one number.'
      );
      hasError = true;
    }

    if (!confirmPwd) {
      showFieldError(confirmInput, 'Please confirm your password.');
      hasError = true;
    } else if (password && confirmPwd !== password) {
      showFieldError(confirmInput, 'Passwords do not match.');
      hasError = true;
    }

    if (hasError) return; // stop here — don't touch localStorage

    // --- CHECK IF EMAIL ALREADY EXISTS ---
    try {
      const existingUsers =
        JSON.parse(localStorage.getItem('cara_users')) || [];

      const userExists = existingUsers.find(function (u) {
        return u.email === email;
      });
      if (userExists) {
        // inline error on the email field, NOT an alert
        showFieldError(
          emailInput,
          'An account with this email already exists.'
        );
        return;
      }

      // --- SAVE NEW USER ---
      const newUser = {
        fullName: fullName,
        email: email,
        password: password,
        interests: interests,
        role: 'USER',
      };

      existingUsers.push(newUser);
      localStorage.setItem('cara_users', JSON.stringify(existingUsers));

      // --- SUCCESS TOAST + disable button + redirect ---
      showToast(
        'Account created successfully! Redirecting to login…',
        'success'
      );
      submitBtn.disabled = true; // prevent double-clicks while toast shows

      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1500);
    } catch (err) {
      console.error('Registration Error:', err);
      showToast('Something went wrong. Please try again.', 'error');
    }
  });
});
