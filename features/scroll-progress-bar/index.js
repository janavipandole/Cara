/**
 * Cara Premium Component Logic: Scroll Progress Indicator Bar
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Scroll Progress Indicator Bar component demo initialized.');
    const area = document.getElementById('scrollArea');
      const bar = document.getElementById('progressIndicator');
      area.addEventListener('scroll', () => {
        const max = area.scrollHeight - area.clientHeight;
        const pct = (area.scrollTop / max) * 100;
        bar.style.width = pct + '%';
      });
  });
})();