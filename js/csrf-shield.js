// Simulated CSRF Token Integrity Guard
document.addEventListener("DOMContentLoaded", () => {
    const checkoutForm = document.querySelector("form");
    if (!checkoutForm) return;

    // Generate random token key
    const token = Math.random().toString(36).substring(2);
    sessionStorage.setItem("cara_csrf_token", token);

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "csrf_token";
    input.value = token;
    checkoutForm.appendChild(input);

    checkoutForm.addEventListener("submit", (e) => {
        const formToken = checkoutForm.querySelector("[name='csrf_token']")?.value;
        const storedToken = sessionStorage.getItem("cara_csrf_token");
        if (formToken !== storedToken) {
            e.preventDefault();
            alert("Security failure: Invalid CSRF Token integrity mismatch.");
        }
    });
});
