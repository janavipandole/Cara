document.addEventListener('DOMContentLoaded', function () {
  var forms = document.querySelectorAll('.newsletter-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var email = input ? input.value.trim() : '';
      var button = form.querySelector('button[type="submit"]');

      // Email validation regex
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
