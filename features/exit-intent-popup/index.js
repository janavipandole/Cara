/**
 * Cara Premium Component Logic: Exit Intent Discount Popup
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Exit Intent Discount Popup component demo initialized.');
    const popup = document.getElementById('exitPopup');
      const close = document.getElementById('closeExitPopup');
      document.addEventListener('mouseleave', function(e) {
        if (e.clientY < 0) {
          popup.style.display = 'flex';
        }
      });
      close.addEventListener('click', () => popup.style.display = 'none');
  });
})();