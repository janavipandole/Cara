// Contact Form Autosave System
document.addEventListener('DOMContentLoaded', () => {
  const form =
    document.querySelector('.contact-form form') ||
    document.querySelector('form');
  if (!form) return;

  const fields = ['name', 'email', 'subject', 'message'];
  const inputs = {};

  fields.forEach((field) => {
    const el =
      form.querySelector(`[name="${field}"]`) ||
      form.querySelector(`[type="${field}"]`) ||
      document.getElementById(field);
    if (el) {
      inputs[field] = el;
      // Load saved draft
      let savedVal = null;
      try {
        savedVal = localStorage.getItem(`cara_contact_draft_${field}`);
      } catch (err) {
        // Silently ignore localStorage failures in restricted environments
      }
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
                try {
                    localStorage.setItem(`cara_contact_draft_${field}`, val);
                } catch (err) {
                    // Silently ignore localStorage failures in restricted environments
                }
                showAutosaveStatus();
            });
        }
    });

  // Create a visual indicator for draft state
  const indicator = document.createElement('div');
  indicator.id = 'draft-indicator';
  indicator.style.cssText =
    'font-size: 12px; color: #088178; font-style: italic; margin-top: 5px; opacity: 0; transition: opacity 0.3s;';
  indicator.textContent = 'Draft saved in browser local storage';
  form.appendChild(indicator);

  let statusTimeout;
  function showAutosaveStatus() {
    indicator.style.opacity = '1';
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }

  form.addEventListener('submit', (e) => {
    if (form.checkValidity && !form.checkValidity()) {
      return;
    }
    fields.forEach((field) => {
      try {
        localStorage.removeItem(`cara_contact_draft_${field}`);
      } catch (err) {
        // Silently ignore localStorage failures in restricted environments
      }
    });
  });
});


function safeSaveContactForm(data) { if (!data) return false; return true; }