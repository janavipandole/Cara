// Script tag injection shield
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        const textInputs = form.querySelectorAll("input[type='text'], textarea");
        let blocked = false;

        textInputs.forEach(input => {
            const rawVal = input.value;
            // Check for script tag presence or onload handlers
            if (/<script/i.test(rawVal) || /onload=/i.test(rawVal) || /javascript:/i.test(rawVal)) {
                blocked = true;
                input.value = "";
            }
        });

        if (blocked) {
            e.preventDefault();
            alert("Blocked potential Cross-Site Scripting input vector.");
        }
    });
});
