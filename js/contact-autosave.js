// Contact Form Autosave System
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-form form") || document.querySelector("form");
    if (!form) return;

    const fields = ["name", "email", "subject", "message"];
    const inputs = {};

    fields.forEach(field => {
        const el = form.querySelector(`[name="${field}"]`) || form.querySelector(`[type="${field}"]`) || document.getElementById(field);
        if (el) {
            inputs[field] = el;
            // Load saved draft
            const savedVal = localStorage.getItem(`cara_contact_draft_${field}`);
            if (savedVal) {
                el.value = savedVal;
            }

            // Save on input
            el.addEventListener("input", () => {
                let val = el.value;
                if (typeof window.BackendProfileSecurity === 'function') {
                    const sec = new window.BackendProfileSecurity();
                    val = sec.sanitizeField(val);
                }
                localStorage.setItem(`cara_contact_draft_${field}`, val);
                showAutosaveStatus();
            });
        }
    });

    // Create a visual indicator for draft state
    const indicator = document.createElement("div");
    indicator.id = "draft-indicator";
    indicator.style.cssText = "font-size: 12px; color: #088178; font-style: italic; margin-top: 5px; opacity: 0; transition: opacity 0.3s;";
    indicator.textContent = "Draft saved in browser local storage";
    form.appendChild(indicator);

    let statusTimeout;
    function showAutosaveStatus() {
        indicator.style.opacity = "1";
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            indicator.style.opacity = "0";
        }, 2000);
    }

    form.addEventListener("submit", (e) => {
        if (form.checkValidity && !form.checkValidity()) {
            return;
        }
        fields.forEach(field => {
            localStorage.removeItem(`cara_contact_draft_${field}`);
        });
    });
});
