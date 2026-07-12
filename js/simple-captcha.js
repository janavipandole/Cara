// Simple Login Mathematics Verification Captcha
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
    if (!loginForm) return;

    let num1, num2, answer;

    function generateCaptcha() {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
        const label = document.getElementById("captcha-math-label");
        if (label) {
            label.textContent = `Verify You Are Human: ${num1} + ${num2} = ?`;
        }
        const input = document.getElementById("captcha-input");
        if (input) {
            input.value = "";
        }
        const feedback = document.getElementById("captcha-feedback");
        if (feedback) {
            feedback.textContent = "";
        }
    }

    const captchaWrapper = document.createElement("div");
    captchaWrapper.className = "login-captcha-container";
    captchaWrapper.style.cssText = "margin-bottom:15px; font-family:sans-serif;";
    captchaWrapper.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <label id="captcha-math-label" style="font-size:13px; font-weight:600; color:#555;"></label>
            <button type="button" id="captcha-reset-btn" aria-label="Refresh Captcha" style="background:none; border:none; color:#088178; cursor:pointer; font-size:16px; padding:0 5px;"><i class="ri-refresh-line"></i></button>
        </div>
        <input type="number" id="captcha-input" required placeholder="Your Answer" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:4px;" />
        <span id="captcha-feedback" style="display:block; font-size:11px; margin-top:4px; color:#e23e57; font-weight:600;"></span>
    `;

    // Insert captcha input before submit button
    const submitBtn = loginForm.querySelector("button") || loginForm.querySelector("[type='submit']");
    if (submitBtn) {
        submitBtn.parentNode.insertBefore(captchaWrapper, submitBtn);
    }

    generateCaptcha();

    const resetBtn = document.getElementById("captcha-reset-btn");
    if (resetBtn) {
        resetBtn.addEventListener("click", generateCaptcha);
    }

    loginForm.addEventListener("submit", (e) => {
        const userAnswer = parseInt(document.getElementById("captcha-input").value);
        if (userAnswer !== answer) {
            e.preventDefault();
            document.getElementById("captcha-feedback").textContent = "Incorrect captcha. Please solve math query correctly.";
        }
    });
});
