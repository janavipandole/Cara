document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');

    // ── Password Visibility Toggle Logic ──
    if (passwordInput && togglePassword && toggleIcon) {
        togglePassword.addEventListener('click', function () {
            const isPasswordHidden = passwordInput.type === 'password';
            passwordInput.type = isPasswordHidden ? 'text' : 'password';

            if (isPasswordHidden) {
                toggleIcon.classList.remove('ri-eye-line');
                toggleIcon.classList.add('ri-eye-off-line');
            } else {
                toggleIcon.classList.remove('ri-eye-off-line');
                toggleIcon.classList.add('ri-eye-line');
            }
        });
    }

    if (!form) return;

    // ── CAPTCHA State ──
    var loginAttempts = 0;
    var captchaCode = '';
    var captchaSection = document.getElementById('captcha-section');
    var captchaCanvas = document.getElementById('captcha-canvas');
    var captchaInput = document.getElementById('captcha-input');
    var captchaRefresh = document.getElementById('captcha-refresh');

    // ── Geometric CAPTCHA Generator ──
    function generateCaptcha() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var code = '';
        for (var i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        captchaCode = code;
        drawCaptcha(code);
        if (captchaInput) captchaInput.value = '';
    }

    function drawCaptcha(code) {
        if (!captchaCanvas) return;
        var ctx = captchaCanvas.getContext('2d');
        var w = captchaCanvas.width;
        var h = captchaCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Background with subtle gradient
        var grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#e8f5e9');
        grad.addColorStop(1, '#e0f2f1');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw decorative geometric shapes
        var shapes = [
            { type: 'circle', x: 20, y: 30, r: 8 },
            { type: 'rect', x: 180, y: 15, size: 12 },
            { type: 'triangle', x: 250, y: 55, size: 10 },
            { type: 'circle', x: 140, y: 60, r: 6 },
            { type: 'rect', x: 50, y: 55, size: 8 }
        ];

        shapes.forEach(function (s) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(Math.random() * 0.5 - 0.25);
            ctx.strokeStyle = 'rgba(8, 129, 120, 0.2)';
            ctx.lineWidth = 1.5;

            if (s.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, s.r, 0, Math.PI * 2);
                ctx.stroke();
            } else if (s.type === 'rect') {
                ctx.strokeRect(-s.size / 2, -s.size / 2, s.size, s.size);
            } else if (s.type === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -s.size);
                ctx.lineTo(-s.size, s.size);
                ctx.lineTo(s.size, s.size);
                ctx.closePath();
                ctx.stroke();
            }
            ctx.restore();
        });

        // Draw each character with geometric styling
        var colors = ['#088178', '#e53935', '#1565c0', '#f57f17', '#6a1b9a'];
        var xStart = 20;
        var spacing = (w - 40) / code.length;

        for (var i = 0; i < code.length; i++) {
            var cx = xStart + spacing * i + spacing / 2;
            var cy = h / 2 + (Math.random() * 10 - 5);

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((Math.random() - 0.5) * 0.4);

            // Character fill with slight transparency
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 0.85;
            ctx.fillText(code[i], 0, 0);

            // Geometric outline behind each char
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = colors[i % colors.length];
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        // Noise lines
        for (var i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * w, Math.random() * h);
            ctx.lineTo(Math.random() * w, Math.random() * h);
            ctx.strokeStyle = 'rgba(0,0,0,0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Noise dots
        for (var i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fill();
        }
    }

    // ── Refresh CAPTCHA ──
    if (captchaRefresh) {
        captchaRefresh.addEventListener('click', generateCaptcha);
    }

    // ── Form Submission Logic ──
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const loginEmailEl = document.getElementById('loginEmail');
        const email = loginEmailEl ? loginEmailEl.value.trim() : '';
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showToast('Please fill all fields.', 'warning');
            return;
        }

        if (/\d/.test(email)) {
            showToast('Numbers are not allowed in the email address.', 'warning');
            return;
        }

        // CAPTCHA verification on second+ attempts
        if (loginAttempts >= 1) {
            var userCode = captchaInput ? captchaInput.value.trim().toUpperCase() : '';
            if (!userCode) {
                showToast('Please enter the security code.', 'warning');
                return;
            }
            if (userCode !== captchaCode) {
                showToast('Incorrect security code. Please try again.', 'error');
                generateCaptcha();
                return;
            }
        }

        // ── Loading state: disable button & show spinner ──
        const submitBtn = form.querySelector('.login-btn');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        // Simulate async request (replace with real API call)
        setTimeout(function () {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            const selectedRoleInput = document.querySelector('input[name="loginRole"]:checked');
            const selectedRole = selectedRoleInput ? selectedRoleInput.value : 'USER';

            if (user) {
                const userRole = user.role || 'USER';

                if (userRole !== selectedRole) {
                    showToast('This account is registered as ' + userRole + '. Please select the correct role.', 'error');
                    if (submitBtn) {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                    }
                    loginAttempts++;
                    if (captchaSection && loginAttempts >= 1) {
                        captchaSection.style.display = 'block';
                        generateCaptcha();
                    }
                    return;
                }

                localStorage.setItem('loggedInUser', JSON.stringify({
                    name: user.username,
                    email: user.email,
                    role: userRole
                }));

                showToast('Welcome back, ' + user.username + '!', 'success');

                setTimeout(function () {
                    if (userRole === 'ADMIN') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);

            } else {
                showToast('Invalid email or password', 'error');
                if (submitBtn) {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                }
                // Show CAPTCHA after first failed attempt
                loginAttempts++;
                if (captchaSection && loginAttempts >= 1) {
                    captchaSection.style.display = 'block';
                    generateCaptcha();
                }
            }
        }, 1500);
    });
});
