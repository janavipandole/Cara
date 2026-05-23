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
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    // EMAIL VALIDATION
    const emailValue = emailInput.value.trim();

    if (emailValue === "") {
        showError(emailInput, "Email is required");
        isValid = false;
    } 
    else if (!validateEmail(emailValue)) {
        showError(emailInput, "Enter a valid email");
        isValid = false;
    } 
    else {
        showSuccess(emailInput);
    }

    // PASSWORD VALIDATION
    const passwordValue = passwordInput.value.trim();

    if (passwordValue === "") {
        showError(passwordInput, "Password is required");
        isValid = false;
    } 
    else if (passwordValue.length < 6) {
        showError(passwordInput, "Password must be at least 6 characters");
        isValid = false;
    } 
    else {
        showSuccess(passwordInput);
    }

    // SUCCESS
    if (isValid) {
        alert("Login Successful!");
        loginForm.submit();
    }
});

// SHOW ERROR
function showError(input, message) {
    const inputGroup = input.parentElement;
    const errorMessage = inputGroup.querySelector(".error-message");

    input.classList.add("error");
    input.classList.remove("success");

    errorMessage.innerText = message;
}

// SHOW SUCCESS
function showSuccess(input) {
    const inputGroup = input.parentElement;
    const errorMessage = inputGroup.querySelector(".error-message");

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