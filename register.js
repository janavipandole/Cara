/* global fetchWithTimeout */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('registerSubmitBtn');
  const passwordInput = document.getElementById('registerPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  // ============================================================
  // PASSWORD STRENGTH METER — NEW FOR #2123
  // ============================================================
  
  const passwordStrengthFill = document.getElementById('passwordStrengthFill');
  const passwordStrengthText = document.getElementById('passwordStrengthText');

  // Requirements checklist elements
  const requirements = {
    length: document.getElementById('req-length'),
    uppercase: document.getElementById('req-uppercase'),
    lowercase: document.getElementById('req-lowercase'),
    number: document.getElementById('req-number'),
    special: document.getElementById('req-special')
  };

  // Validation rules for password strength
  const checks = {
    length: (pwd) => pwd.length >= 8,
    uppercase: (pwd) => /[A-Z]/.test(pwd),
    lowercase: (pwd) => /[a-z]/.test(pwd),
    number: (pwd) => /[0-9]/.test(pwd),
    special: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  };

  /**
   * Update password strength meter in real-time
   */
  function updatePasswordStrength() {
    const password = passwordInput.value;
    
    // Check all requirements
    const results = {
      length: checks.length(password),
      uppercase: checks.uppercase(password),
      lowercase: checks.lowercase(password),
      number: checks.number(password),
      special: checks.special(password)
    };
    
    // Count passed checks
    const passedChecks = Object.values(results).filter(Boolean).length;
    
    // Update UI for each requirement
    Object.entries(results).forEach(([key, passed]) => {
      if (passed) {
        requirements[key].classList.add('met');
        requirements[key].querySelector('.req-icon').textContent = '✓';
      } else {
        requirements[key].classList.remove('met');
        requirements[key].querySelector('.req-icon').textContent = '✗';
      }
    });
    
    // Update strength bar and text
    let strength = 'Weak';
    let strengthClass = 'weak';
    
    if (password.length === 0) {
      strength = 'Enter a password';
      strengthClass = '';
      passwordStrengthFill.className = 'password-strength-fill';
    } else if (passedChecks <= 2) {
      strength = '🔴 Weak - Add more variety';
      strengthClass = 'weak';
    } else if (passedChecks === 3) {
      strength = '🟡 Fair - Almost there';
      strengthClass = 'fair';
    } else if (passedChecks >= 4) {
      strength = '🟢 Strong - Great password!';
      strengthClass = 'strong';
    }
    
    // Update bar
    passwordStrengthFill.className = `password-strength-fill ${strengthClass}`;
    
    // Update text
    passwordStrengthText.textContent = strength;
    passwordStrengthText.className = `password-strength-text ${strengthClass}`;
  }

  /**
   * Check if passwords match (live feedback)
   */
  function checkPasswordMatch() {
    const confirmHint = document.getElementById('confirmHint');
    if (confirmPasswordInput.value === '') {
      confirmHint.textContent = '';
      confirmHint.style.color = '';
      return;
    }

    if (passwordInput.value === confirmPasswordInput.value) {
      confirmHint.textContent = '✓ Passwords match';
      confirmHint.style.color = '#27ae60';
    } else {
      confirmHint.textContent = '✗ Passwords do not match';
      confirmHint.style.color = '#e74c3c';
    }
  }

  // Add event listeners for password strength meter
  if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordStrength);
  }

  // Add event listener for password match checking
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    passwordInput.addEventListener('input', checkPasswordMatch);
  }

  // ============================================================
  // TOGGLE PASSWORD VISIBILITY
  // ============================================================

  const togglePasswordBtn = document.getElementById('togglePassword');
  const registerToggleIcon = document.getElementById('registerToggleIcon');

  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        registerToggleIcon.classList.remove('ri-eye-line');
        registerToggleIcon.classList.add('ri-eye-off-line');
      } else {
        passwordInput.type = 'password';
        registerToggleIcon.classList.remove('ri-eye-off-line');
        registerToggleIcon.classList.add('ri-eye-line');
      }
    });
  }

  const confirmTogglePasswordBtn = document.getElementById('confirmTogglePassword');
  const confirmToggleIcon = document.getElementById('confirmToggleIcon');

  if (confirmTogglePasswordBtn) {
    confirmTogglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        confirmToggleIcon.classList.remove('ri-eye-line');
        confirmToggleIcon.classList.add('ri-eye-off-line');
      } else {
        confirmPasswordInput.type = 'password';
        confirmToggleIcon.classList.remove('ri-eye-off-line');
        confirmToggleIcon.classList.add('ri-eye-line');
      }
    });
  }

  // ============================================================
  // REGISTRATION FORM SUBMISSION
  // ============================================================

  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerUsername')?.value.trim();
    const email = document.getElementById('registerEmail')?.value.trim();
    const password = passwordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;

    // Clear previous error messages
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmError').textContent = '';

    let hasError = false;

    // Validate username
    if (!username) {
      document.getElementById('nameError').textContent = 'Full name is required';
      hasError = true;
    }

    // Validate email
    if (!email) {
      document.getElementById('emailError').textContent = 'Email is required';
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('emailError').textContent = 'Please enter a valid email';
      hasError = true;
    }

    // Validate password
    if (!password) {
      document.getElementById('passwordError').textContent = 'Password is required';
      hasError = true;
    } else if (password.length < 8) {
      document.getElementById('passwordError').textContent = 'Password must be at least 8 characters long';
      hasError = true;
    }

    // Check password complexity (at least 4 of 5 criteria)
    if (password) {
      const results = {
        length: checks.length(password),
        uppercase: checks.uppercase(password),
        lowercase: checks.lowercase(password),
        number: checks.number(password),
        special: checks.special(password)
      };
      const passedChecks = Object.values(results).filter(Boolean).length;

      if (passedChecks < 4) {
        document.getElementById('passwordError').textContent = 
          'Password must contain at least: uppercase, lowercase, number, and special character';
        hasError = true;
      }
    }

    // Validate password confirmation
    if (!confirmPassword) {
      document.getElementById('confirmError').textContent = 'Please confirm your password';
      hasError = true;
    } else if (password !== confirmPassword) {
      document.getElementById('confirmError').textContent = 'Passwords do not match';
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // All validation passed — proceed with registration
    try {
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

      // Show success toast
      if (typeof showToast === 'function') {
        showToast('Account created successfully! Redirecting...', 'success');
      }

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (err) {
      // Show error toast
      if (typeof showToast === 'function') {
        showToast(err.message, 'error');
      } else {
        alert('Registration failed: ' + err.message);
      }
    }
  });
});