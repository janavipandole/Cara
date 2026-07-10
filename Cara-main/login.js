document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');
    const rememberMe = document.getElementById('rememberMe');

    // ==============================
    // Toggle Password Visibility
    // ==============================
    if (passwordInput && togglePassword) {
        togglePassword.addEventListener('click', function () {

            const isHidden = passwordInput.type === 'password';

            passwordInput.type = isHidden ? 'text' : 'password';

            this.innerHTML = isHidden
                ? '<i class="ri-eye-off-line"></i>'
                : '<i class="ri-eye-line"></i>';
        });
    }

    if (!form) return;

    // ==============================
    // Login Form Submit
    // ==============================
    form.addEventListener('submit', function (e) {

        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Empty field validation
        if (!email || !password) {
            showToast('Please fill all fields.', 'warning');
            return;
        }

        // Email format validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showToast('Please enter a valid email.', 'warning');
            return;
        }

        // Loading state
        const submitBtn = form.querySelector('.login-btn');

        if (submitBtn) {
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        }

        // Simulate API request
        setTimeout(function () {

            try {

                // Read users safely
                let users = [];

                try {
                    users = JSON.parse(localStorage.getItem('users')) || [];
                } catch (error) {
                    console.error("Invalid users data:", error);
                    users = [];
                }

                // Find matching user
                const user = users.find(
                    u => u.email === email && u.password === password
                );

                if (user) {

                    // Save logged-in user
                    localStorage.setItem('loggedInUser', email);

                    // Save user name (if available)
                    if (user.name) {
                        localStorage.setItem('loggedInUserName', user.name);
                    }

                    // Remember Me
                    if (rememberMe && rememberMe.checked) {
                        localStorage.setItem('rememberedUser', email);
                    } else {
                        localStorage.removeItem('rememberedUser');
                    }

                    // Remove loading state
                    if (submitBtn) {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                    }

                    // Success message
                    showToast("Login successful!", "success");

                    // Redirect after a short delay
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000);

                } else {

                    showToast("Invalid email or password", "error");

                    if (submitBtn) {
                        submitBtn.classList.remove('btn-loading');
                        submitBtn.disabled = false;
                    }
                }

            } catch (error) {

                console.error(error);

                showToast("Something went wrong. Please try again.", "error");

                if (submitBtn) {
                    submitBtn.classList.remove('btn-loading');
                    submitBtn.disabled = false;
                }
            }

        }, 1500);

    });

    // ==============================
    // Load Remembered User
    // ==============================
    const rememberedUser = localStorage.getItem('rememberedUser');

    if (rememberedUser) {
        document.getElementById('loginEmail').value = rememberedUser;

        if (rememberMe) {
            rememberMe.checked = true;
        }
    }

});