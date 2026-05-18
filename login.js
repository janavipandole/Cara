document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('loginForm');
    const passwordInput = document.getElementById('loginPassword');
    const togglePassword = document.getElementById('togglePassword');

    /* =========================
       PASSWORD TOGGLE
    ========================== */

    if (passwordInput && togglePassword) {

        togglePassword.addEventListener('click', function () {

            const isPasswordHidden =
                passwordInput.type === 'password';

            passwordInput.type =
                isPasswordHidden ? 'text' : 'password';

            this.innerHTML = isPasswordHidden

                ? '<i class="ri-eye-off-line"></i>'
                : '<i class="ri-eye-line"></i>';
        });
    }

    /* =========================
       LOGIN FORM
    ========================== */

    if (form) {

        form.addEventListener('submit', function (e) {

            e.preventDefault();

            const email =
                document.getElementById('loginEmail')
                .value
                .trim()
                .toLowerCase();

            const password =
                document.getElementById('loginPassword')
                .value
                .trim();

            if (!email || !password) {

                showToast(
                    "Please fill all fields",
                    "error"
                );

                return;
            }

            // Get users from localStorage
            const users =
                JSON.parse(
                    localStorage.getItem('users')
                ) || [];

            console.log(users);

            // Find matching user
            const user = users.find(user =>

                user.email.toLowerCase() === email &&
                user.password === password
            );

            if (user) {

                localStorage.setItem(
                    'loggedInUser',
                    JSON.stringify(user)
                );

                showToast(
                    "Login Successful",
                    "success"
                );

                setTimeout(() => {

                    window.location.href = 'index.html';

                }, 1200);

            } else {

                showToast(
                    "Incorrect email or password",
                    "error"
                );
            }
        });
    }

    /* =========================
       GOOGLE LOGIN
    ========================== */

    const googleBtn =
        document.getElementById("googleLogin");

    if (googleBtn) {

        googleBtn.addEventListener("click", () => {

            showToast(
                "Google Login Coming Soon",
                "success"
            );
        });
    }

    /* =========================
       GITHUB LOGIN
    ========================== */

    const githubBtn =
        document.getElementById("githubLogin");

    if (githubBtn) {

        githubBtn.addEventListener("click", () => {

            showToast(
                "GitHub Login Coming Soon",
                "success"
            );
        });
    }

    /* =========================
       DARK MODE TOGGLE
    ========================== */

    const themeToggle =
        document.querySelector(".theme-toggle");

    const body = document.body;

    const themeIcon =
        document.querySelector(".theme-toggle i");

    // Load saved theme
    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "dark") {

        body.setAttribute("data-theme", "dark");

        if (themeIcon) {

            themeIcon.classList.remove("ri-moon-line");

            themeIcon.classList.add("ri-sun-line");
        }
    }

    // Toggle theme
    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            const isDark =
                body.getAttribute("data-theme") === "dark";

            if (isDark) {

                body.removeAttribute("data-theme");

                localStorage.setItem(
                    "theme",
                    "light"
                );

                if (themeIcon) {

                    themeIcon.classList.remove("ri-sun-line");

                    themeIcon.classList.add("ri-moon-line");
                }

            } else {

                body.setAttribute(
                    "data-theme",
                    "dark"
                );

                localStorage.setItem(
                    "theme",
                    "dark"
                );

                if (themeIcon) {

                    themeIcon.classList.remove("ri-moon-line");

                    themeIcon.classList.add("ri-sun-line");
                }
            }
        });
    }
});

/* =========================
   CLICK OUTSIDE MODAL
========================= */

window.addEventListener("click", function (e) {

    const overlay =
        document.getElementById("fp-overlay");

    if (e.target === overlay) {

        closeForgotPassword();
    }
});

/* =========================
   OPEN MODAL
========================= */

function openForgotPassword() {

    const overlay =
        document.getElementById("fp-overlay");

    if (overlay) {

        overlay.classList.add("active");
    }
}

/* =========================
   CLOSE MODAL
========================= */

function closeForgotPassword() {

    const overlay =
        document.getElementById("fp-overlay");

    if (overlay) {

        overlay.classList.remove("active");
    }
}

/* =========================
   RESET PASSWORD
========================= */

function submitForgotPassword() {

    const email =
        document.getElementById("fp-email")
        .value
        .trim()
        .toLowerCase();

    const newPassword =
        document.getElementById("fp-newpass")
        .value
        .trim();

    if (!email || !newPassword) {

        showToast(
            "Please fill all fields",
            "error"
        );

        return;
    }

    let users =
        JSON.parse(
            localStorage.getItem("users")
        ) || [];

    const userIndex =
        users.findIndex(user =>

            user.email.toLowerCase() === email
        );

    if (userIndex === -1) {

        showToast(
            "Email not found",
            "error"
        );

        return;
    }

    users[userIndex].password =
        newPassword;

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    showToast(
        "Password Reset Successful",
        "success"
    );

    closeForgotPassword();
}

/* =========================
   TOAST MESSAGE
========================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById("toast");

    const toastMsg =
        document.getElementById("toast-msg");

    const toastIcon =
        document.getElementById("toast-icon");

    if (!toast) {

        alert(message);

        return;
    }

    toastMsg.innerText = message;

    if (type === "success") {

        toastIcon.innerHTML = "✅";

    } else {

        toastIcon.innerHTML = "❌";
    }

    toast.className =
        `toast show ${type}`;

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}