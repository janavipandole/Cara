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
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});
const registerForm = document.getElementById("registerForm");

const username = document.getElementById("registerUsername");
const email = document.getElementById("registerEmail");
const password = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");

registerForm.addEventListener("submit", function (e) {

    e.preventDefault();

    let isValid = true;

    // USERNAME VALIDATION
    if (username.value.trim() === "") {

        showError(username, "Full name is required");
        isValid = false;

    } else {

        showSuccess(username);
    }

    // EMAIL VALIDATION
    if (email.value.trim() === "") {

        showError(email, "Email is required");
        isValid = false;

    } else if (!validateEmail(email.value.trim())) {

        showError(email, "Enter a valid email");
        isValid = false;

    } else {

        showSuccess(email);
    }

    // PASSWORD VALIDATION
    if (password.value.trim() === "") {

        showError(password, "Password is required");
        isValid = false;

    } else if (password.value.length < 6) {

        showError(password, "Password must be at least 6 characters");
        isValid = false;

    } else {

        showSuccess(password);
    }

    // CONFIRM PASSWORD VALIDATION
    if (confirmPassword.value.trim() === "") {

        showError(confirmPassword, "Please confirm password");
        isValid = false;

    } else if (confirmPassword.value !== password.value) {

        showError(confirmPassword, "Passwords do not match");
        isValid = false;

    } else {

        showSuccess(confirmPassword);
    }

    // SUCCESS
    if (isValid) {

        alert("Registration Successful!");

        registerForm.submit();
    }
});

// SHOW ERROR
function showError(input, message) {

    const formGroup = input.closest(".form-group");

    const errorMessage =
        formGroup.querySelector(".error-message");

    input.classList.add("error");
    input.classList.remove("success");

    errorMessage.innerText = message;
}

// SHOW SUCCESS
function showSuccess(input) {

    const formGroup = input.closest(".form-group");

    const errorMessage =
        formGroup.querySelector(".error-message");

    input.classList.add("success");
    input.classList.remove("error");

    errorMessage.innerText = "";
}

// EMAIL VALIDATION FUNCTION
function validateEmail(email) {

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);
}