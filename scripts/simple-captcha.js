// Simple Login Mathematics Verification Captcha
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
    if (!loginForm) return;

    // Generate random math query
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;

    const captchaWrapper = document.createElement("div");
    captchaWrapper.className = "login-captcha-container";
    captchaWrapper.style.cssText = "margin-bottom:15px; font-family:sans-serif;";
    captchaWrapper.innerHTML = `
        <label style="display:block; font-size:13px; font-weight:600; margin-bottom:5px; color:#555;">Verify You Are Human: ${num1} + ${num2} = ?</label>
        <input type="number" id="captcha-input" required placeholder="Your Answer" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;" />
        <span id="captcha-feedback" style="display:block; font-size:11px; margin-top:4px; color:#e23e57; font-weight:600;"></span>
    `;

    // Insert captcha input before submit button
    const submitBtn = loginForm.querySelector("button") || loginForm.querySelector("[type='submit']");
    if (submitBtn) {
        submitBtn.parentNode.insertBefore(captchaWrapper, submitBtn);
    }

    loginForm.addEventListener("submit", (e) => {
        const userAnswer = parseInt(document.getElementById("captcha-input").value);
        if (userAnswer !== answer) {
            e.preventDefault();
            document.getElementById("captcha-feedback").textContent = "Incorrect captcha. Please solve math query correctly.";
        }
    });
});
