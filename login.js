document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const passwordInput = document.getElementById('loginPassword');
  const togglePassword = document.getElementById('togglePassword');
  const toggleIcon = document.getElementById('toggleIcon');
  const loginEmailEl = document.getElementById('loginEmail');

  // PASSWORD TOGGLE
  if (passwordInput && togglePassword && toggleIcon) {
    togglePassword.addEventListener('click', function () {
      const isPasswordHidden = passwordInput.type === 'password';

      passwordInput.type = isPasswordHidden ? 'text' : 'password';

      toggleIcon.classList.toggle('ri-eye-line', !isPasswordHidden);

      toggleIcon.classList.toggle('ri-eye-off-line', isPasswordHidden);
    });
  }

  if (!form) return;

  // EMAIL VALIDATION
  if (loginEmailEl) {
    loginEmailEl.addEventListener('blur', function () {
      const emailVal = loginEmailEl.value.trim();

      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

      loginEmailEl.classList.toggle('is-valid', isValid && emailVal !== '');

      loginEmailEl.classList.toggle('is-invalid', !isValid && emailVal !== '');
    });
  }

  // CAPTCHA
  let loginAttempts = 0;
  let captchaCode = '';

  const captchaSection = document.getElementById('captcha-section');

  const captchaCanvas = document.getElementById('captcha-canvas');

  const captchaInput = document.getElementById('captcha-input');

  const captchaRefresh = document.getElementById('captcha-refresh');

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let code = '';

    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    captchaCode = code;

    drawCaptcha(code);

    if (captchaInput) {
      captchaInput.value = '';
    }
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
      const x = 40 + i * 45;
      const y = h / 2;

      ctx.save();

      ctx.translate(x, y);

      ctx.rotate((Math.random() - 0.5) * 0.4);

      ctx.fillText(code[i], 0, 0);

      ctx.restore();
    }
  }

  if (captchaRefresh) {
    captchaRefresh.addEventListener('click', generateCaptcha);
  }

  // FORM SUBMIT
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = loginEmailEl.value.trim();

    const password = passwordInput.value;

    if (!email || !password) {
      showToast('Please fill all fields.', 'warning');

      return;
    }

    // CAPTCHA AFTER FAILED LOGIN
    if (loginAttempts >= 1) {
      const userCode = captchaInput.value.trim().toUpperCase();

      if (!userCode) {
        showToast('Please enter the security code.', 'warning');

        return;
      }

      if (userCode !== captchaCode) {
        showToast('Incorrect security code.', 'error');

        generateCaptcha();

        return;
      }
    }

    const submitBtn = form.querySelector('.login-btn');

    if (submitBtn) {
      submitBtn.disabled = true;

      submitBtn.classList.add('btn-loading');
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password.');
      }

      localStorage.setItem('token', data.access_token);

      localStorage.setItem(
        'loggedInUser',
        JSON.stringify({
          name: data.user.username,
          email: data.user.email,
          role: data.user.role,
        })
      );

      showToast('Welcome back, ' + data.user.username + '!', 'success');

      setTimeout(() => {
        window.location.href =
          data.user.role === 'ADMIN' ? 'admin.html' : 'index.html';
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');

      loginAttempts++;

      if (captchaSection && loginAttempts >= 1) {
        captchaSection.style.display = 'block';

        generateCaptcha();
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;

        submitBtn.classList.remove('btn-loading');
      }
    }
  });
});
