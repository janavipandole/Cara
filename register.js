document.addEventListener('DOMContentLoaded', function () {
    console.log("register.js loaded");

    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('registerSubmitBtn');

    if (!form) {
        console.error("registerForm not found!");
        return;
    }

    if (!submitBtn) {
        console.error("registerSubmitBtn not found!");
        return;
    }

    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();

        console.log("Register button clicked");

        const name = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Get selected role
        const roleElement = document.querySelector('input[name="registerRole"]:checked');
        const role = roleElement ? roleElement.value : "USER";

        console.log("Collected Form Data:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Password Length:", password.length);
        console.log("Role:", role);

        // Empty field validation
        if (!name || !email || !password || !confirmPassword) {
            console.warn("Validation failed: Empty fields");
            showToast('Please fill all fields.', 'warning');
            return;
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            console.warn("Validation failed: Weak password");
            showToast(
                'Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
                'warning'
            );
            return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            console.warn("Validation failed: Password mismatch");
            showToast('Passwords do not match.', 'warning');
            return;
        }

        // Get existing users
        let users = JSON.parse(localStorage.getItem('users') || '[]');

        console.log("Existing users:", users);

        // Duplicate email check
        if (users.find(u => u.email === email)) {
            console.warn("Validation failed: Email already exists");
            showToast('Email already registered.', 'error');
            return;
        }

        // Duplicate username check
        if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
            console.warn("Validation failed: Username already exists");
            showToast('Username already exists.', 'error');
            return;
        }

        const newUser = {
            name,
            email,
            password,
            role
        };

        console.log("Creating new user:", newUser);

        // Save user
        users.push(newUser);

        localStorage.setItem('users', JSON.stringify(users));

        console.log("Users saved to localStorage");
        console.log(JSON.parse(localStorage.getItem('users')));

        // Save logged in user
        localStorage.setItem('loggedInUser', email);

        console.log("loggedInUser set:", email);

        // Success toast
        showToast('Signup successful! Welcome to Cara.', 'success');

        
        // Redirect
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});