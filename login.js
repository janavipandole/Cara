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

            if (user) {
                // On successful login
                localStorage.setItem('loggedInUser', email);
                window.location.href = 'index.html';
            } else {
                showToast("Invalid email or password", "error");
                // ── Re-enable button on failure ──
                if (submitBtn) {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                }
            }
        }, 1500);
    });
});