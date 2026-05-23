document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    const passwordInput = document.getElementById('registerPassword');
    const meterContainer = document.getElementById('passwordStrengthMeter');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (passwordInput && meterContainer && strengthBar && strengthText) {
        passwordInput.addEventListener('input', function() {
            const val = passwordInput.value;
            if (val.length > 0) {
                meterContainer.style.display = 'block';
                strengthText.style.display = 'inline-block';
            } else {
                meterContainer.style.display = 'none';
                strengthText.style.display = 'none';
                return;
            }

            let score = 0;
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[a-z]/.test(val)) score++;
            if (/\d/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++; // Special characters

            // Reset classes
            strengthBar.className = 'strength-bar';
            strengthText.className = 'strength-text';

            if (score <= 2) {
                strengthBar.classList.add('weak');
                strengthText.classList.add('weak');
                strengthText.textContent = 'Weak';
            } else if (score === 3 || score === 4) {
                strengthBar.classList.add('medium');
                strengthText.classList.add('medium');
                strengthText.textContent = 'Medium';
            } else {
                strengthBar.classList.add('strong');
                strengthText.classList.add('strong');
                strengthText.textContent = 'Strong';
            }
        });
    }
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!name || !email || !password) {
            showToast('Please fill all fields.', 'warning');
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            showToast('Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.', 'warning');
            return;
        }

        // Confirm Password validation
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'warning');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            showToast('Email already registered.', 'error');
            return;
        }
        if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
            showToast('Username already exists.', 'error');
            return;
        }

        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        // On successful registration
        showToast('Signup successful! Welcome to Cara.', 'success');
        localStorage.setItem('loggedInUser', email);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});
