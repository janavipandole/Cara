document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');

    if (passwordInput && togglePassword) {

    togglePassword.addEventListener('click', function () {

        const isPasswordHidden = passwordInput.type === 'password';

        passwordInput.type = isPasswordHidden ? 'text' : 'password';

        this.innerHTML = isPasswordHidden

            ? '<i class="ri-eye-off-line"></i>'
            : '<i class="ri-eye-line"></i>';
    });
    
}

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showToast('Please fill all fields.', 'warning');
            return;
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
                if (submitBtn) {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                }
            }
        }, 1500);
    });
});
