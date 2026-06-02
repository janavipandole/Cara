document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');

    // =========================
    // 🔐 Password Toggle Logic
    // =========================
    if (passwordInput && togglePassword && toggleIcon) {
        togglePassword.addEventListener('click', function () {
            const isHidden = passwordInput.type === 'password';

            // Toggle input type
            passwordInput.type = isHidden ? 'text' : 'password';

            // Toggle icon
            toggleIcon.classList.toggle('ri-eye-line', !isHidden);
            toggleIcon.classList.toggle('ri-eye-off-line', isHidden);
        });
    }

    // =========================
    // 🚫 Stop if form missing
    // =========================
    if (!form) return;

    // =========================
    // 📩 Form Submit Logic
    // =========================
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showToast('Please fill all fields.', 'warning');
            return;
        }

        // =========================
        // ⏳ Loading State
        // =========================
        const submitBtn = form.querySelector('.login-btn');

        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        // =========================
        // 🧠 Fake API Simulation
        // =========================
        setTimeout(function () {

            const users = JSON.parse(localStorage.getItem('users') || '[]');

            const user = users.find(
                u => u.email === email && u.password === password
            );

            const selectedRoleInput = document.querySelector('input[name="loginRole"]:checked');
            const selectedRole = selectedRoleInput ? selectedRoleInput.value : 'USER';

            if (user) {

                const userRole = user.role || 'USER';

                // ❌ Role mismatch
                if (userRole !== selectedRole) {
                    showToast(`This account is registered as ${userRole}. Please select correct role.`, 'error');

                    if (submitBtn) {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                    }

                    return;
                }

                // ✅ Save logged-in user
                localStorage.setItem('loggedInUser', JSON.stringify({
                    name: user.username,
                    email: user.email,
                    role: userRole
                }));

                showToast(`Welcome back, ${user.username}!`, 'success');

                // 🔁 Redirect
                setTimeout(function () {
                    window.location.href = userRole === 'ADMIN'
                        ? 'admin.html'
                        : 'index.html';
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