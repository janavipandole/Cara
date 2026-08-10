/**
 * Cara Premium Component Logic: Copy to Clipboard Promo Button
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Copy to Clipboard Promo Button component demo initialized.');
    const code = document.getElementById('promoCode');
      const btn = document.getElementById('copyBtn');
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(code.textContent).then(() => {
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy', 2000);
        });
      });
  });
})();