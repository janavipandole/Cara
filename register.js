const registerForm = document.getElementById("registerForm");
const submitButton = document.getElementById("submitBtn");

// ─────────────────────────────────────────────
// FORM SUBMIT
// ─────────────────────────────────────────────

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document
    .getElementById("registerUsername")
    .value.trim();

  const email = document
    .getElementById("registerEmail")
    .value.trim();

  const password =
    document.getElementById("registerPassword").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;

  const usernameInput =
    document.getElementById("registerUsername");

  const emailInput =
    document.getElementById("registerEmail");

  const passwordInput =
    document.getElementById("registerPassword");

  const confirmPasswordInput =
    document.getElementById("confirmPassword");

  // Reset borders
  resetFieldStyles();

  // Empty fields
  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    showError("Please fill in all fields.");
    shakeForm();
    return;
  }

  // Username validation
  if (username.length < 3) {
    setFieldState(usernameInput, false);
    showError(
      "Username must be at least 3 characters long."
    );
    shakeForm();
    return;
  }

  if (!/^[a-zA-Z\s]+$/.test(username)) {
    setFieldState(usernameInput, false);
    showError(
      "Username should contain only letters."
    );
    shakeForm();
    return;
  }

  setFieldState(usernameInput, true);

  // Email validation
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setFieldState(emailInput, false);
    showError("Please enter a valid email address.");
    shakeForm();
    return;
  }

  setFieldState(emailInput, true);

  // Password validations

  if (/\s/.test(password)) {
    setFieldState(passwordInput, false);
    showError(
      "Password must not contain spaces."
    );
    shakeForm();
    return;
  }

  if (password.length < 8) {
    setFieldState(passwordInput, false);
    showError(
      "Password must be at least 8 characters long."
    );
    shakeForm();
    return;
  }

  if (!/[A-Z]/.test(password)) {
    setFieldState(passwordInput, false);
    showError(
      "Password must contain at least one uppercase letter."
    );
    shakeForm();
    return;
  }

  if (!/[a-z]/.test(password)) {
    setFieldState(passwordInput, false);
    showError(
      "Password must contain at least one lowercase letter."
    );
    shakeForm();
    return;
  }

  if (!/[0-9]/.test(password)) {
    setFieldState(passwordInput, false);
    showError(
      "Password must contain at least one number."
    );
    shakeForm();
    return;
  }

  if (
    !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    )
  ) {
    setFieldState(passwordInput, false);
    showError(
      "Password must contain at least one special character."
    );
    shakeForm();
    return;
  }

  setFieldState(passwordInput, true);

  // Confirm password validation
  if (password !== confirmPassword) {
    setFieldState(confirmPasswordInput, false);
    showError("Passwords do not match.");
    shakeForm();
    return;
  }

  setFieldState(confirmPasswordInput, true);

  // Check existing users
  const users =
    JSON.parse(localStorage.getItem("users")) || [];

  const emailAlreadyExists = users.find(
    (u) => u.email === email
  );

  if (emailAlreadyExists) {
    setFieldState(emailInput, false);
    showError(
      "An account with this email already exists."
    );
    shakeForm();
    return;
  }

  // Save user
  users.push({
    username,
    email,
    password,
  });

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  );

  showSuccess(
    "Account created successfully! Redirecting..."
  );

  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});

// ─────────────────────────────────────────────
// PASSWORD LIVE VALIDATION
// ─────────────────────────────────────────────

document
  .getElementById("registerPassword")
  .addEventListener("input", function () {

    const val = this.value;

    const hint =
      document.getElementById("passwordHint");

    const strengthFill =
      document.getElementById("strengthFill");

    if (!hint) return;

    if (/\s/.test(val)) {
      hint.textContent =
        "✗ Spaces are not allowed.";
      hint.style.color = "#e74c3c";
    }

    else if (val.length === 0) {
      hint.textContent = "";

      if (strengthFill) {
        strengthFill.style.width = "0%";
      }
    }

    else {
      const checks = [
        {
          pass: val.length >= 8,
          msg: "8+ characters",
        },
        {
          pass: /[A-Z]/.test(val),
          msg: "uppercase letter",
        },
        {
          pass: /[a-z]/.test(val),
          msg: "lowercase letter",
        },
        {
          pass: /[0-9]/.test(val),
          msg: "number",
        },
        {
          pass:
            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
              val
            ),
          msg: "special character",
        },
      ];

      const missing = checks
        .filter((c) => !c.pass)
        .map((c) => c.msg);

      if (missing.length === 0) {
        hint.textContent =
          "✓ Strong password!";
        hint.style.color = "#27ae60";
      } else {
        hint.textContent =
          "Missing: " + missing.join(", ");
        hint.style.color = "#f39c12";
      }

      // Strength bar
      let strength = 0;

      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[a-z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[!@#$%^&*]/.test(val)) strength++;

      const widths = [
        "0%",
        "20%",
        "40%",
        "60%",
        "80%",
        "100%",
      ];

      const colors = [
        "",
        "#e74c3c",
        "#f39c12",
        "#f1c40f",
        "#2ecc71",
        "#27ae60",
      ];

      if (strengthFill) {
        strengthFill.style.width =
          widths[strength];

        strengthFill.style.background =
          colors[strength];
      }
    }
  });

// ─────────────────────────────────────────────
// CONFIRM PASSWORD LIVE CHECK
// ─────────────────────────────────────────────

document
  .getElementById("confirmPassword")
  .addEventListener("input", function () {

    const password =
      document.getElementById("registerPassword")
        .value;

    const hint =
      document.getElementById("confirmHint");

    if (!hint) return;

    if (this.value === "") {
      hint.textContent = "";
    }

    else if (this.value !== password) {
      hint.textContent =
        "✗ Passwords do not match";

      hint.style.color = "#e74c3c";
    }

    else {
      hint.textContent =
        "✓ Passwords match";

      hint.style.color = "#27ae60";
    }
  });

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function showError(msg) {
  removeMessage();

  const el = document.createElement("p");

  el.id = "formMessage";
  el.textContent = msg;

  el.style.cssText = `
    color:#e74c3c;
    font-size:13px;
    margin-top:10px;
    text-align:center;
    font-weight:500;
  `;

  registerForm.appendChild(el);
}

function showSuccess(msg) {
  removeMessage();

  const el = document.createElement("p");

  el.id = "formMessage";
  el.textContent = msg;

  el.style.cssText = `
    color:#27ae60;
    font-size:13px;
    margin-top:10px;
    text-align:center;
    font-weight:500;
  `;

  registerForm.appendChild(el);
}

function removeMessage() {
  const existing =
    document.getElementById("formMessage");

  if (existing) existing.remove();
}

function setFieldState(input, isValid) {
  input.style.border = isValid
    ? "2px solid #27ae60"
    : "2px solid #e74c3c";
}

function resetFieldStyles() {
  const inputs =
    registerForm.querySelectorAll("input");

  inputs.forEach((input) => {
    input.style.border =
      "1px solid #dcdcdc";
  });
}

function shakeForm() {
  registerForm.classList.add("shake");

  setTimeout(() => {
    registerForm.classList.remove("shake");
  }, 300);
}

/// ─────────────────────────────────────────────
// PASSWORD TOGGLE
// ─────────────────────────────────────────────

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const registerPasswordInput =
      document.getElementById(
        "registerPassword"
      );

    const confirmPasswordInput =
      document.getElementById(
        "confirmPassword"
      );

    const togglePasswordButton =
      document.getElementById(
        "togglePassword"
      );

    const confirmTogglePasswordButton =
      document.getElementById(
        "confirmTogglePassword"
      );

    const registerToggleIcon =
      document.getElementById(
        "registerToggleIcon"
      );

    const confirmToggleIcon =
      document.getElementById(
        "confirmToggleIcon"
      );

    function setupPasswordToggle(
      inputField,
      toggleButton,
      iconElement
    ) {
      if (
        inputField &&
        toggleButton &&
        iconElement
      ) {

        toggleButton.addEventListener(
          "click",
          function () {

            const isHidden =
              inputField.type === "password";

            // Toggle input type
            inputField.type = isHidden
              ? "text"
              : "password";

            // Toggle icon
            if (isHidden) {
              iconElement.classList.remove(
                "ri-eye-line"
              );

              iconElement.classList.add(
                "ri-eye-off-line"
              );

            } else {

              iconElement.classList.remove(
                "ri-eye-off-line"
              );

              iconElement.classList.add(
                "ri-eye-line"
              );
            }
          }
        );
      }
    }

    // Initialize toggles
    setupPasswordToggle(
      registerPasswordInput,
      togglePasswordButton,
      registerToggleIcon
    );

    setupPasswordToggle(
      confirmPasswordInput,
      confirmTogglePasswordButton,
      confirmToggleIcon
    );
  }
);