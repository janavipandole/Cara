document.addEventListener('DOMContentLoaded', function () {
  // grab all the elements we need
  const form = document.getElementById('loginForm');
  const passwordInput = document.getElementById('loginPassword');
  const toggleBtn = document.getElementById('togglePassword');
  const toggleIcon = document.getElementById('toggleIcon');
  const emailInput = document.getElementById('loginEmail');
  const submitBtn = document.getElementById('loginSubmitBtn');

  // error spans
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const formError = document.getElementById('formError');

  // captcha stuff
  const captchaSection = document.getElementById('captcha-section');
  const captchaCanvas = document.getElementById('captcha-canvas');
  const captchaInput = document.getElementById('captcha-input');
  const captchaRefresh = document.getElementById('captcha-refresh');
  const captchaError = document.getElementById('captchaError');

  let loginAttempts = 0;
  let captchaCode = '';

  // ============================================================
  // HELPER: show a toast notification
  // type = 'success' | 'error'
  // ============================================================
  function showToast(message, type) {
    // make sure the container exists (it's in the HTML)
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type; // toast.css handles the look
    toast.textContent = message;

    container.appendChild(toast);

    // trigger the slide-in animation (small timeout lets the browser paint first)
    setTimeout(function () {
      toast.classList.add('show');
    }, 10);

    // auto-remove after 3 seconds
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 400); // matches the CSS transition duration
    }, 3000);
  }

  // ============================================================
  // HELPER: show an inline error under a specific field
  // ============================================================
  function showError(spanEl, message) {
    if (!spanEl) return;
    spanEl.textContent = message;
  }

  // ============================================================
  // HELPER: clear all inline errors at once
  // ============================================================
  function clearAllErrors() {
    if (emailError) emailError.textContent = '';
    if (passwordError) passwordError.textContent = '';
    if (formError) formError.textContent = '';
    if (captchaError) captchaError.textContent = '';

    // remove red border from inputs too
    emailInput.classList.remove('is-invalid', 'is-valid');
    passwordInput.classList.remove('is-invalid');
  }

  // ============================================================
  // PASSWORD TOGGLE — show/hide the password text
  // ============================================================
  if (toggleBtn && passwordInput && toggleIcon) {
    toggleBtn.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'ri-eye-off-line';
        toggleBtn.setAttribute('aria-label', 'Hide password');
      } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'ri-eye-line';
        toggleBtn.setAttribute('aria-label', 'Show password');
      }
    });
  }

  // ============================================================
  // EMAIL VALIDATION ON BLUR
  // Shows a green or red border as the user leaves the field.
  // ============================================================
  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      const val = emailInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

      emailInput.classList.toggle('is-valid', isValid && val !== '');
      emailInput.classList.toggle('is-invalid', !isValid && val !== '');

      if (val !== '' && !isValid) {
        showError(emailError, 'Please enter a valid email address.');
      } else {
        if (emailError) emailError.textContent = '';
      }
    });
  }

  // ============================================================
  // CAPTCHA HELPERS
  // ============================================================
  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaCode = code;
    drawCaptcha(code);
    if (captchaInput) captchaInput.value = '';
  }

  function drawCaptcha(code) {
    if (!captchaCanvas) return;
    const ctx = captchaCanvas.getContext('2d');
    const w = captchaCanvas.width;
    const h = captchaCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f3f3f3';
    ctx.fillRect(0, 0, w, h);
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#088178';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      const x = 20 + i * 26;
      const y = h / 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
<<<<<<< fix/login-register-flow
  }

  if (captchaRefresh) {
    captchaRefresh.addEventListener('click', generateCaptcha);
  }

  // ============================================================
  // PRE-FILL remembered email if the user ticked "Remember me"
  // ============================================================
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    const rememberBox = document.getElementById('rememberMe');
    if (rememberBox) rememberBox.checked = true;
  }

  // ============================================================
  // FORM SUBMIT
  // ============================================================
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors(); // wipe any previous errors before checking again

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // --- basic empty-field check ---
    let hasError = false;

    if (!email) {
      showError(emailError, 'Email address is required.');
      emailInput.classList.add('is-invalid');
      hasError = true;
    }

    if (!password) {
      showError(passwordError, 'Password is required.');
      passwordInput.classList.add('is-invalid');
      hasError = true;
    }

    if (hasError) return; // stop here, don't hit localStorage

    // --- captcha check (only active after a failed attempt) ---
    if (captchaSection && captchaSection.style.display !== 'none') {
      const userCaptcha = captchaInput
        ? captchaInput.value.trim().toUpperCase()
        : '';
      if (userCaptcha !== captchaCode) {
        showError(captchaError, 'Incorrect security code. Please try again.');
        generateCaptcha(); // refresh so they can't just re-submit the same wrong answer
        return;
      }
=======

    // CAPTCHA
    let loginAttempts = 0;
    let currentCaptchaToken = '';

    const captchaSection =
        document.getElementById('captcha-section');

    const captchaCanvas =
        document.getElementById('captcha-canvas');

    const captchaInput =
        document.getElementById('captcha-input');

    const captchaRefresh =
        document.getElementById('captcha-refresh');

    async function fetchCaptcha() {
        try {
            const res = await fetch('/api/auth/captcha');
            if (res.ok) {
                const data = await res.json();
                currentCaptchaToken = data.captcha_token;
                if (captchaCanvas) {
                    const ctx = captchaCanvas.getContext('2d');
                    const img = new Image();
                    img.onload = function() {
                        ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
                        ctx.drawImage(img, 0, 0, captchaCanvas.width, captchaCanvas.height);
                    };
                    img.src = data.captcha_image;
                }
            }
        } catch(e) {
            console.error("Failed to fetch secure captcha");
        }
        if (captchaInput) {
            captchaInput.value = '';
        }
    }

    if (captchaRefresh) {
        captchaRefresh.addEventListener(
            'click',
            fetchCaptcha
        );
>>>>>>> main
    }

    // --- check credentials against localStorage ---
    try {
      const existingUsers =
        JSON.parse(localStorage.getItem('cara_users')) || [];
      const foundUser = existingUsers.find(function (u) {
        return u.email === email;
      });

      if (!foundUser) {
        // show error under the email field — that's where the problem is
        showError(emailError, 'No account found with this email address.');
        emailInput.classList.add('is-invalid');
        bumpAttempts();
        return;
      }

      if (foundUser.password !== password) {
        // show error under the password field
        showError(passwordError, 'Incorrect password. Please try again.');
        passwordInput.classList.add('is-invalid');
        bumpAttempts();
        return;
      }

      // --- SUCCESS ---

      // save "remember me" preference
      const rememberBox = document.getElementById('rememberMe');
      if (rememberBox && rememberBox.checked) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // save login tokens
      localStorage.setItem('token', 'mock_jwt_token_12345');
      localStorage.setItem(
        'loggedInUser',
        JSON.stringify({
          name: foundUser.fullName,
          email: foundUser.email,
          role: foundUser.role || 'USER',
        })
      );

      // Show success toast, disable button, then redirect after 1.5s
      showToast(
        'Welcome back, ' + foundUser.fullName + '! Redirecting…',
        'success'
      );
      submitBtn.disabled = true; // stop double-clicks

      setTimeout(function () {
        window.location.href = 'index.html';
      }, 1500);
    } catch (err) {
      console.error('Login Error:', err);
      showError(formError, 'Something went wrong. Please try again.');
      bumpAttempts();
    }
<<<<<<< fix/login-register-flow
  });

  // Show captcha after the first failed login attempt
  function bumpAttempts() {
    loginAttempts++;
    if (captchaSection && loginAttempts >= 1) {
      captchaSection.style.display = 'block';
      generateCaptcha();
    }
  }
});
=======

    // FORM SUBMIT
    form.addEventListener('submit', async function (e) {
        const rememberMeCheckbox = document.getElementById('remember-me');
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedEmail', loginEmailEl.value.trim());
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        e.preventDefault();

        const email =
            loginEmailEl.value.trim();

        const password =
            passwordInput.value;

        if (!email || !password) {

            showToast(
                'Please fill all fields.',
                'warning'
            );

            return;
        }

        // ENFORCE CAPTCHA REQUIREMENT
        let payload = { email, password };

        if (loginAttempts >= 1) {
            const userCode = captchaInput.value.trim();

            if (!userCode) {
                showToast('Please enter the security code.', 'warning');
                return;
            }
            
            payload.captcha_answer = userCode;
            payload.captcha_token = currentCaptchaToken;
        }

        const submitBtn =
            form.querySelector('.login-btn');

        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.classList.add(
                'btn-loading'
            );
        }

        try {

            const response = await fetchWithTimeout(
                '/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    'Invalid email or password.'
                );
            }

            localStorage.setItem(
                'token',
                data.access_token
            );

            localStorage.setItem(
                'loggedInUser',
                JSON.stringify({
                    name: data.user.username,
                    email: data.user.email,
                    role: data.user.role
                })
            );

            showToast(
                'Welcome back, ' +
                data.user.username +
                '!',
                'success'
            );

            setTimeout(() => {

                window.location.href =
                    data.user.role === 'ADMIN'
                        ? 'admin.html'
                        : 'index.html';

            }, 1000);

        } catch (err) {

            showToast(
                err.message,
                'error'
            );

            loginAttempts++;

            if (captchaSection && loginAttempts >= 1) {
                captchaSection.style.display = 'block';
                fetchCaptcha();
            }

        } finally {

            if (submitBtn) {

                submitBtn.disabled = false;

                submitBtn.classList.remove(
                    'btn-loading'
                );
            }
        }
    });
});
>>>>>>> main
