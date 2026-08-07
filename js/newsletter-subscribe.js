/**
 * Validates that an email address has a properly-formed domain with a
 * top-level domain of at least two characters.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmailDomain(email) {
  if (!email || typeof email !== 'string') return false;
  // Basic structural check: local@domain.tld with at least 2-char TLD
  const domainRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(email.trim());
}

document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('.newsletter-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input ? input.value.trim() : '';
      const button = form.querySelector('button[type="submit"]');

      // Email validation: structural format and domain TLD check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const hasValidDomain = validateEmailDomain(email);

      if (!email || !emailRegex.test(email)) {
        if (typeof showToast === 'function') {
          showToast('Please enter a valid email address', 'error');
        } else {
          alert('Please enter a valid email address');
        }
        return;
      }

      if (!validateEmailDomain(email)) {
        if (typeof showToast === 'function') {
          showToast('Please enter a valid email domain (e.g. example.com)', 'error');
        } else {
          alert('Please enter a valid email address');
        }
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = 'Subscribing...';
      }

      // Simulate a network request
      setTimeout(function () {
        if (typeof showToast === 'function') {
          showToast('Successfully subscribed to newsletter!', 'success');
        } else {
          alert('Successfully subscribed to newsletter!');
        }

        // Notify other page modules that a subscription happened.
        window.dispatchEvent(
          new CustomEvent('newsletterSubscribed', {
            detail: { email: email },
          }),
        );
        
        if (input) input.value = '';
        
        if (button) {
          button.disabled = false;
          button.textContent = 'Sign Up';
        }
      }, 800);
    });
  });
});


export function isValidNewsletterEmail(email) { if (!email || typeof email !== 'string') return false; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()); }