document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('.newsletter-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input ? input.value.trim() : '';
      const button = form.querySelector('button[type="submit"]');

      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        if (typeof showToast === 'function') {
          showToast('Please enter a valid email address', 'error');
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
        
        if (input) input.value = '';
        
        if (button) {
          button.disabled = false;
          button.textContent = 'Sign Up';
        }
      }, 800);
    });
  });
});
