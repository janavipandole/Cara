document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');

    // ── Password Visibility Toggle Logic ──
    if (passwordInput && togglePassword && toggleIcon) {
        togglePassword.addEventListener('click', function () {
            // Toggle the input field's type attribute
            const isPasswordHidden = passwordInput.type === 'password';
            passwordInput.type = isPasswordHidden ? 'text' : 'password';

            // Toggle the Remix Icon classes cleanly without modifying innerHTML structure
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

    let loginFailures = 0;
    let generatedCaptcha = '';

    // Generate random CAPTCHA string
    function generateCaptchaText() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Render distorted CAPTCHA to Canvas
    function drawCaptchaCanvas(text) {
        let canvas = document.getElementById('captchaCanvas');
        if (!canvas) {
            const wrap = document.createElement('div');
            wrap.id = 'captchaWrap';
            wrap.style.cssText = 'margin-bottom: 15px; text-align: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);';
            wrap.innerHTML = `
                <canvas id="captchaCanvas" width="180" height="50" style="background:#fff; border-radius:4px; display:block; margin: 0 auto 10px auto;"></canvas>
                <div style="display:flex; gap: 8px;">
                    <input type="text" id="captchaInput" placeholder="Enter CAPTCHA" required style="flex:1; padding:8px; border-radius:4px; border:1px solid #ccc; font-size:13px;" />
                    <button type="button" id="refreshCaptcha" style="background:#088178; color:#fff; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;"><i class="ri-refresh-line"></i></button>
                </div>
            `;
            const passWrap = passwordInput.closest('.form-group') || passwordInput.parentNode;
            passWrap.parentNode.insertBefore(wrap, passWrap.nextSibling);
            canvas = document.getElementById('captchaCanvas');

            document.getElementById('refreshCaptcha').addEventListener('click', () => {
                generatedCaptcha = generateCaptchaText();
                drawCaptchaCanvas(generatedCaptcha);
            });
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background noise
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        for (let i = 0; i < canvas.width; i += 15) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 15) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        // Draw text with distortions
        ctx.font = 'bold 24px monospace';
        ctx.fillStyle = '#0f172a';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            const x = 20 + i * 24;
            const y = canvas.height / 2 + (Math.random() * 10 - 5);
            const angle = (Math.random() * 30 - 15) * Math.PI / 180;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        }

        // Distortion lines overlay
        ctx.strokeStyle = '#088178';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.bezierCurveTo(
                Math.random() * canvas.width, Math.random() * canvas.height,
                Math.random() * canvas.width, Math.random() * canvas.height,
                Math.random() * canvas.width, Math.random() * canvas.height
            );
            ctx.stroke();
        }
    }

    // ── Form Submission Logic ──
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showToast('Please fill all fields.', 'warning');
            return;
        }

        if (/\d/.test(email)) {
            showToast('Numbers are not allowed in the email address.', 'warning');
            return;
        }

        // CAPTCHA Validation Check
        if (loginFailures >= 1) {
            const userCaptcha = document.getElementById('captchaInput').value.trim();
            if (userCaptcha.toLowerCase() !== generatedCaptcha.toLowerCase()) {
                showToast('Incorrect CAPTCHA. Please try again.', 'error');
                generatedCaptcha = generateCaptchaText();
                drawCaptchaCanvas(generatedCaptcha);
                document.getElementById('captchaInput').value = '';
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

            // Get selected role from the radio buttons
            const selectedRoleInput = document.querySelector('input[name="loginRole"]:checked');
            const selectedRole = selectedRoleInput ? selectedRoleInput.value : 'USER';

            if (user) {
                const userRole = user.role || 'USER';

                // Role mismatch check
                if (userRole !== selectedRole) {
                    showToast(`This account is registered as ${userRole}. Please select the correct role.`, 'error');
                    if (submitBtn) {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                    }
                    return;
                }

                // Store full user object with role
                localStorage.setItem('loggedInUser', JSON.stringify({
                    name: user.username,
                    email: user.email,
                    role: userRole
                }));

                showToast(`Welcome back, ${user.username}!`, 'success');
                loginFailures = 0; // reset

                // Role-based redirect
                setTimeout(function () {
                    if (userRole === 'ADMIN') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);

            } else {
                showToast("Invalid email or password", "error");
                loginFailures++;
                
                // Show CAPTCHA on subsequent failures
                if (loginFailures >= 1) {
                    generatedCaptcha = generateCaptchaText();
                    drawCaptchaCanvas(generatedCaptcha);
                }

                if (submitBtn) {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                }
            }
        }, 1500);
    });
});
