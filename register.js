document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');

    // Check email validity
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) return false;

        const domain = email.split('@')[1].toLowerCase();
        return domain === 'gmail.com';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Empty field validation
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill all fields.');
            return;
        }

        // Gmail validation
        if (!isValidEmail(email)) {
            alert('Enter a valid Gmail address.');
            return;
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            alert(
                'Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
            );
            return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        let users = JSON.parse(localStorage.getItem('users') || '[]');

        // Email already exists
        if (users.find(u => u.email === email)) {
            alert('Email already registered.');
            return;
        }

        // Username already exists
        if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
            alert('Username already exists.');
            return;
        }

        // Save user
        users.push({ name, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        // Login user
        localStorage.setItem('loggedInUser', email);

        // Success message
        alert('Signup successful! You are now logged in.');

        // Redirect
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});