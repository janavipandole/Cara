/**
 * Cara Premium Component Logic: Smooth Back to Top FAB
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Smooth Back to Top FAB component demo initialized.');
    const area = document.getElementById('fabScrollArea');
      const fab = document.getElementById('backToTopFab');
      area.addEventListener('scroll', () => {
        if (area.scrollTop > 150) { fab.style.display = 'flex'; }
        else { fab.style.display = 'none'; }
      });
      fab.addEventListener('click', () => {
        area.scrollTo({ top: 0, behavior: 'smooth' });
      });
  });
})();