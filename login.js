// ===============================
// PASSWORD TOGGLE
// ===============================

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("loginPassword");
const toggleIcon = document.getElementById("toggleIcon");

togglePassword.addEventListener("click", () => {
    const type =
        passwordInput.getAttribute("type") === "password"
            ? "text"
            : "password";

    passwordInput.setAttribute("type", type);

    // Toggle icon
    toggleIcon.classList.toggle("ri-eye-line");
    toggleIcon.classList.toggle("ri-eye-off-line");
});

// ===============================
// LOGIN FORM SUBMIT
// ===============================

document
    .getElementById("loginForm")
    .addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document
            .getElementById("loginEmail")
            .value
            .trim();

        const password = document
            .getElementById("loginPassword")
            .value
            .trim();

        // Validation
        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        // Demo user object
        const extractedName = email.split("@")[0];

const formattedName =
    extractedName.charAt(0).toUpperCase() +
    extractedName.slice(1);

const user = {
    name: formattedName,
    email: email,
    orders: 5
};

        // Save user data
        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        // Success alert
        alert("Login successful!");

        // Redirect to profile page
        window.location.href = "profile.html";
    });