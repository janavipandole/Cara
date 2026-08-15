/**
 * Cara Premium Component Logic: Size Guide Modal
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Size Guide Modal component demo initialized.');
    const open = document.getElementById('openSizeGuide');
      const close = document.getElementById('closeSizeGuide');
      const modal = document.getElementById('sizeGuideModal');
      open.addEventListener('click', () => modal.style.display = 'flex');
      close.addEventListener('click', () => modal.style.display = 'none');
  });
})();