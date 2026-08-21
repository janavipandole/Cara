/**
 * Cara Premium Component Logic: Dynamic Free Shipping Bar
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Dynamic Free Shipping Bar component demo initialized.');
    const progress = document.getElementById('shippingProgress');
      const message = document.getElementById('shippingMessage');
      const btn = document.getElementById('addTenDollars');
      let currentVal = 0;
      const limit = 100;
      
      function update() {
        const pct = Math.min((currentVal / limit) * 100, 100);
        progress.style.width = pct + '%';
        if (currentVal >= limit) {
          message.textContent = 'Congratulations! You unlocked free shipping!';
          progress.style.background = '#22c55e';
        } else {
          message.textContent = 'Add $' + (limit - currentVal) + ' more to unlock free shipping!';
        }
      }
      btn.addEventListener('click', () => {
        currentVal += 10;
        update();
      });
      update();
  });
})();