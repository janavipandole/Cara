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
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  
  if (!username || !email || !password || !confirmPassword) {
    showError("Please fill in all fields.");
    return;
  }

  
  if (/\s/.test(password)) {
    showError("Password must not contain spaces.");
    return;
  }

  
  if (password.length < 8) {
    showError("Password must be at least 8 characters long.");
    return;
  }

  if (!/[A-Z]/.test(password)) {
    showError("Password must contain at least one uppercase letter (A-Z).");
    return;
  }

  if (!/[a-z]/.test(password)) {
    showError("Password must contain at least one lowercase letter (a-z).");
    return;
  }

  if (!/[0-9]/.test(password)) {
    showError("Password must contain at least one number (0-9).");
    return;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    showError("Password must contain at least one special character (e.g. @, #, $).");
    return;
  }

  
  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const emailAlreadyExists = users.find((u) => u.email === email);
  if (emailAlreadyExists) {
    showError("An account with this email already exists.");
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  showSuccess("Account created successfully! Redirecting to login...");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});


document.getElementById("registerPassword").addEventListener("input", function () {
  const val = this.value;
  const hint = document.getElementById("passwordHint");
  if (!hint) return;

  if (/\s/.test(val)) {
    hint.textContent = "✗ Spaces are not allowed in the password.";
    hint.style.color = "#e74c3c";
  } else if (val.length === 0) {
    hint.textContent = "";
  } else {
    const checks = [
      { pass: val.length >= 8, msg: "8+ characters" },
      { pass: /[A-Z]/.test(val), msg: "uppercase letter" },
      { pass: /[a-z]/.test(val), msg: "lowercase letter" },
      { pass: /[0-9]/.test(val), msg: "number" },
      { pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), msg: "special character" },
    ];

    const missing = checks.filter((c) => !c.pass).map((c) => c.msg);

    if (missing.length === 0) {
      hint.textContent = "✓ Strong password!";
      hint.style.color = "#27ae60";
    } else {
      hint.textContent = "Missing: " + missing.join(", ");
      hint.style.color = "#e67e22";
    }
  }
});

function showError(msg) {
  const existing = document.getElementById("formMessage");
  if (existing) existing.remove();

  const el = document.createElement("p");
  el.id = "formMessage";
  el.textContent = msg;
  el.style.cssText = "color:#e74c3c; font-size:13px; margin-top:10px; text-align:center;";
  registerForm.appendChild(el);
}

function showSuccess(msg) {
  const existing = document.getElementById("formMessage");
  if (existing) existing.remove();

  const el = document.createElement("p");
  el.id = "formMessage";
  el.textContent = msg;
  el.style.cssText = "color:#27ae60; font-size:13px; margin-top:10px; text-align:center;";
  registerForm.appendChild(el);
}