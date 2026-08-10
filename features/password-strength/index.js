/**
 * Cara Premium Component Logic: Password Strength Meter
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Password Strength Meter component demo initialized.');
    const pass = document.getElementById('password');
      const bar = document.getElementById('strengthBar');
      const text = document.getElementById('strengthText');
      pass.addEventListener('input', (e) => {
        const val = e.target.value;
        let score = 0;
        if (val.length > 5) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        
        const pct = (score / 4) * 100;
        bar.style.width = pct + '%';
        if (score === 1) { bar.style.background = '#ef4444'; text.textContent = 'Weak'; }
        else if (score === 2) { bar.style.background = '#f97316'; text.textContent = 'Medium'; }
        else if (score === 3) { bar.style.background = '#eab308'; text.textContent = 'Strong'; }
        else if (score === 4) { bar.style.background = '#22c55e'; text.textContent = 'Excellent'; }
        else { bar.style.width = '0'; text.textContent = 'Very Weak'; }
      });
  });
})();