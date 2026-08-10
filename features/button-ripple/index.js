/**
 * Cara Premium Component Logic: Button Click Ripple Effect
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Button Click Ripple Effect component demo initialized.');
    const btn = document.getElementById('rippleBtn');
      btn.addEventListener('click', function(e) {
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple-span');
        
        const ripple = btn.getElementsByClassName('ripple-span')[0];
        if (ripple) { ripple.remove(); }
        btn.appendChild(circle);
      });
  });
})();