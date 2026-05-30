document.addEventListener("DOMContentLoaded", () => {
    console.log("register.js loaded");

    const btn = document.getElementById("registerSubmitBtn");

    if (!btn) {
        console.error("Submit button not found!");
        return;
    }

    btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const username = document.getElementById("registerUsername")?.value.trim();
        const email = document.getElementById("registerEmail")?.value.trim();
        const password = document.getElementById("registerPassword")?.value.trim();
        const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

        const role = document.querySelector('input[name="registerRole"]:checked')?.value || "USER";

        const messageBox = document.getElementById("formMessage");

        // basic validation
        if (!username || !email || !password) {
            messageBox.innerText = "All fields are required!";
            messageBox.style.color = "red";
            return;
        }

        if (password !== confirmPassword) {
            messageBox.innerText = "Passwords do not match!";
            messageBox.style.color = "red";
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            console.log("Success:", data);

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            messageBox.style.color = "green";
            messageBox.innerText = "Account created successfully! Redirecting...";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);

        } catch (err) {
            console.error(err);
            messageBox.style.color = "red";
            messageBox.innerText = err.message;
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("password");
    const bar1 = document.getElementById("strength-bar-1");
    const bar2 = document.getElementById("strength-bar-2");
    const bar3 = document.getElementById("strength-bar-3");
    const bar4 = document.getElementById("strength-bar-4");
    const text = document.getElementById("strength-text");

    if (passwordInput && bar1) {
        passwordInput.addEventListener("input", () => {
            const val = passwordInput.value;
            let score = 0;
            
            if (val.length >= 8) score++;
            if (/[A-Z]/.test(val)) score++;
            if (/[0-9]/.test(val)) score++;
            if (/[^A-Za-z0-9]/.test(val)) score++;

            // Clear all
            [bar1, bar2, bar3, bar4].forEach(bar => bar.style.background = "#eee");

            if (val.length === 0) {
                text.innerText = "";
            } else if (score === 1) {
                bar1.style.background = "#ef4444";
                text.innerText = "Weak";
                text.style.color = "#ef4444";
            } else if (score === 2) {
                bar1.style.background = "#f59e0b";
                bar2.style.background = "#f59e0b";
                text.innerText = "Fair";
                text.style.color = "#f59e0b";
            } else if (score === 3) {
                bar1.style.background = "#3b82f6";
                bar2.style.background = "#3b82f6";
                bar3.style.background = "#3b82f6";
                text.innerText = "Good";
                text.style.color = "#3b82f6";
            } else if (score === 4) {
                bar1.style.background = "#10b981";
                bar2.style.background = "#10b981";
                bar3.style.background = "#10b981";
                bar4.style.background = "#10b981";
                text.innerText = "Very Strong";
                text.style.color = "#10b981";
            }
        });
    }
});
