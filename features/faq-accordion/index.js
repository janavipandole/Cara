/**
 * Cara Premium Component Logic: FAQ Accordion Component
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('FAQ Accordion Component component demo initialized.');
    document.querySelectorAll('.faq-header').forEach(h => {
        h.addEventListener('click', function() {
          const item = this.parentElement;
          item.classList.toggle('active');
        });
      });
  });
})();