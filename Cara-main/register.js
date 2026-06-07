document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
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
        localStorage.setItem('loggedInUserName', name);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});