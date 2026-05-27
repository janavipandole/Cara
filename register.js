const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const roleInput = document.querySelector('input[name="registerRole"]:checked');
  const selectedRole = roleInput ? roleInput.value : 'USER';

  
  if (!username || !email || !password || !confirmPassword) {
    showError("Please fill in all fields.");
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

  if (/\d/.test(email)) {
    setFieldState(emailInput, false);
    showError("Numbers are not allowed in the email address.");
    shakeForm();
    return;
  }

  setFieldState(emailInput, true);

  // Password validations
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

  users.push({ username, email, password, role: selectedRole });
  localStorage.setItem("users", JSON.stringify(users));

  showSuccess(`${selectedRole === 'ADMIN' ? 'Admin' : 'User'} account created successfully! Redirecting to login...`);
  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
});


document.getElementById("registerPassword").addEventListener("input", function () {
  const val = this.value;
  const hint = document.getElementById("passwordHint");
  if (!hint) return;

  // Dynamically inject the visual meter bar if not present
  let meterWrap = document.getElementById("passwordStrengthMeterWrap");
  if (!meterWrap) {
    meterWrap = document.createElement("div");
    meterWrap.id = "passwordStrengthMeterWrap";
    meterWrap.style.cssText = "margin-top: 10px; margin-bottom: 10px;";
    meterWrap.innerHTML = `
      <div style="background: rgba(0,0,0,0.1); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 5px;">
        <div id="strengthBar" style="height: 100%; width: 0%; background: #e74c3c; transition: width 0.3s ease, background 0.3s ease;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <span id="strengthLabel" style="font-weight: 600; color: #e74c3c;">Weak</span>
        <span id="strengthPercent" style="color: #888;">0%</span>
      </div>
    `;
    hint.parentNode.insertBefore(meterWrap, hint);
  }

  if (/\s/.test(val)) {
    hint.textContent = "✗ Spaces are not allowed in the password.";
    hint.style.color = "#e74c3c";
    return;
  }

  if (val.length === 0) {
    hint.textContent = "";
    document.getElementById("strengthBar").style.width = "0%";
    document.getElementById("strengthLabel").textContent = "Too Short";
    document.getElementById("strengthPercent").textContent = "0%";
    return;
  }

  const checks = [
    { pass: val.length >= 8, weight: 20 },
    { pass: /[A-Z]/.test(val), weight: 20 },
    { pass: /[a-z]/.test(val), weight: 20 },
    { pass: /[0-9]/.test(val), weight: 20 },
    { pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), weight: 20 },
  ];

  const score = checks.reduce((acc, c) => acc + (c.pass ? c.weight : 0), 0);
  const bar = document.getElementById("strengthBar");
  const label = document.getElementById("strengthLabel");
  const pct = document.getElementById("strengthPercent");

  bar.style.width = score + "%";
  pct.textContent = score + "%";

  if (score <= 40) {
    bar.style.background = "#e74c3c"; // red
    label.textContent = "Weak";
    label.style.color = "#e74c3c";
  } else if (score <= 80) {
    bar.style.background = "#f39c12"; // orange
    label.textContent = "Medium";
    label.style.color = "#f39c12";
  } else {
    bar.style.background = "#27ae60"; // green
    label.textContent = "Strong";
    label.style.color = "#27ae60";
  }

  const missing = [
    { pass: val.length >= 8, msg: "8+ chars" },
    { pass: /[A-Z]/.test(val), msg: "uppercase" },
    { pass: /[a-z]/.test(val), msg: "lowercase" },
    { pass: /[0-9]/.test(val), msg: "number" },
    { pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), msg: "special symbol" },
  ].filter((c) => !c.pass).map((c) => c.msg);

  if (missing.length === 0) {
    hint.textContent = "✓ Password meets all guidelines!";
    hint.style.color = "#27ae60";
  } else {
    hint.textContent = "Requirements left: " + missing.join(", ");
    hint.style.color = "#e67e22";
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
