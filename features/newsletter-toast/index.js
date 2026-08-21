/**
 * Cara Premium Component Logic: Newsletter Subscribe Toast
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Newsletter Subscribe Toast component demo initialized.');
    const form = document.getElementById('subForm');
      const toast = document.getElementById('toastNotification');
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        toast.style.display = 'flex';
        setTimeout(() => toast.style.display = 'none', 3000);
      });
  });
})();