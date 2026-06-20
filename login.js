document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');
    const loginEmailEl = document.getElementById('loginEmail');

    // PASSWORD TOGGLE
    if (passwordInput && togglePassword && toggleIcon) {

        togglePassword.addEventListener('click', function () {

            const isPasswordHidden =
                passwordInput.type === 'password';

            passwordInput.type =
                isPasswordHidden ? 'text' : 'password';

            toggleIcon.classList.toggle(
                'ri-eye-line',
                !isPasswordHidden
            );

            toggleIcon.classList.toggle(
                'ri-eye-off-line',
                isPasswordHidden
            );
        });
    }

    if (!form) return;

    // EMAIL VALIDATION
    if (loginEmailEl) {

        loginEmailEl.addEventListener('blur', function () {

            const emailVal =
                loginEmailEl.value.trim();

            const isValid =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

            loginEmailEl.classList.toggle(
                'is-valid',
                isValid && emailVal !== ''
            );

            loginEmailEl.classList.toggle(
                'is-invalid',
                !isValid && emailVal !== ''
            );
        });
    }

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
    }

    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && loginEmailEl) {
        loginEmailEl.value = rememberedEmail;
        const rememberMeCheckbox = document.getElementById('remember-me');
        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
    }

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

            // Token is now set as an HttpOnly cookie automatically

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