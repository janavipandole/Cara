/* global fetchWithTimeout */
const API_BASE_URL = window.CARA_API_BASE_URL || 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const passwordInput = document.getElementById('loginPassword');
  const toggleBtn = document.getElementById('togglePassword');
  const toggleIcon = document.getElementById('toggleIcon');
  const emailInput = document.getElementById('loginEmail');
  const submitBtn = document.getElementById('loginSubmitBtn');

  // captcha stuff
  const captchaSection = document.getElementById('captcha-section');
  const captchaCanvas = document.getElementById('captcha-canvas');
  const captchaInput = document.getElementById('captcha-input');
  const captchaRefresh = document.getElementById('captcha-refresh');

  let loginAttempts = 0;
  let currentCaptchaToken = '';

  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  if (toggleBtn && passwordInput && toggleIcon) {
    toggleBtn.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'ri-eye-off-line';
      } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'ri-eye-line';
      }
    });
  }

  async function fetchCaptcha() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/captcha`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        currentCaptchaToken = data.captcha_token;
        if (captchaCanvas) {
          const ctx = captchaCanvas.getContext('2d');
          const img = new Image();
          img.onload = function () {
            ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
            ctx.drawImage(img, 0, 0, captchaCanvas.width, captchaCanvas.height);
          };
          img.src = data.captcha_image;
        }
      }
    } catch (e) {
      window.logError('Failed to fetch secure captcha');
    }
    if (captchaInput) {
      captchaInput.value = '';
    }
  }

  if (captchaRefresh) {
    captchaRefresh.addEventListener('click', fetchCaptcha);
  }

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const rawEmail = emailInput ? emailInput.value : '';
    const email = window.CaraSanitize
      ? window.CaraSanitize.sanitizeInput(rawEmail)
      : rawEmail.trim();
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
      showToast('Please fill all fields.', 'warning');
      return;
    }

    let payload = { email, password };

    // Support both simple math captcha and backend generated captcha validations
    const mathCaptchaInput = document.getElementById('captcha-input');
    if (
      mathCaptchaInput &&
      mathCaptchaInput.closest('.login-captcha-container')
    ) {
      const mathAnswer = mathCaptchaInput.value.trim();
      if (!mathAnswer) {
        showToast('Please enter the human verification answer.', 'warning');
        return;
      }
    }

    if (loginAttempts >= 1) {
      const userCode = captchaInput ? captchaInput.value.trim() : '';
      if (!userCode) {
        showToast('Please enter the security code.', 'warning');
        return;
      }
      payload.captcha_answer = userCode;
      payload.captcha_token = currentCaptchaToken;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
    }

    try {
      const fetchFunc =
        typeof fetchWithTimeout === 'function' ? fetchWithTimeout : fetch;
      const response = await fetchFunc(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password.');
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('cara_user_token', data.access_token);
      localStorage.setItem('cara_user_email', data.user.email);
      localStorage.setItem('cara_user_name', data.user.username);
      localStorage.setItem('cara_user_role', data.user.role);

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
        fetchCaptcha();
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
      }
    }
  });
});
