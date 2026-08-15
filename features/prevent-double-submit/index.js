/**
 * Cara Premium Component Logic: Form Double Submit Blocker
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Form Double Submit Blocker component demo initialized.');
    const form = document.getElementById('doubleSubmitForm');
      const btn = document.getElementById('submitBtn');
      const txt = document.getElementById('btnText');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        btn.classList.add('btn-loading');
        btn.disabled = true;
        txt.textContent = 'Submitting...';
        setTimeout(() => {
          btn.classList.remove('btn-loading');
          btn.disabled = false;
          txt.textContent = 'Submit Inquiry';
          alert('Form submitted successfully!');
        }, 2000);
      });
  });
})();