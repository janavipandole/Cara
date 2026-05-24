document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');
    const toggleIcon = document.getElementById('toggleIcon');

    // ── Password Visibility Toggle Logic ──
    // ADD THIS INSIDE THE VISIBILITY TOGGLE IF STATEMENT:
if (passwordInput && togglePassword && toggleIcon) {
    // Make it focusable if it isn't an HTML button element
    if (!togglePassword.hasAttribute('tabindex')) {
        togglePassword.setAttribute('tabindex', '0');
        togglePassword.setAttribute('role', 'button');
        togglePassword.setAttribute('aria-label', 'Toggle password visibility');
    }

    const toggleVisibility = function () {
        const isPasswordHidden = passwordInput.type === 'password';
        passwordInput.type = isPasswordHidden ? 'text' : 'password';
        togglePassword.setAttribute('aria-aria-expanded', !isPasswordHidden);

        toggleIcon.classList.toggle('ri-eye-line', !isPasswordHidden);
        toggleIcon.classList.toggle('ri-eye-off-line', isPasswordHidden);
    };

    togglePassword.addEventListener('click', toggleVisibility);
    togglePassword.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleVisibility();
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

        // ── Loading state: disable button & show spinner ──
        const submitBtn = form.querySelector('.login-btn');
        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        // Simulate async request (replace with real API call)
        // UPDATE THE SETTIMEOUT WRAPPER:
setTimeout(function () {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', email);
            window.location.href = 'index.html';
        } else {
            showToast("Invalid email or password", "error");
            resetButton();
        }
    } catch (error) {
        console.error("Authentication error:", error);
        showToast("An unexpected authentication error occurred.", "error");
        resetButton();
    }

    function resetButton() {
        if (submitBtn) {
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }
}, 1500);
    });
});