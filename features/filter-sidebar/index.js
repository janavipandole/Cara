/**
 * Cara Premium Component Logic: Shop Filter/Sort Sidebar
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Shop Filter/Sort Sidebar component demo initialized.');
    const sidebar = document.getElementById('filterSidebar');
      const open = document.getElementById('toggleFilter');
      const close = document.getElementById('closeFilter');
      const range = document.getElementById('priceRange');
      const val = document.getElementById('priceVal');
      
      open.addEventListener('click', () => sidebar.classList.add('open'));
      close.addEventListener('click', () => sidebar.classList.remove('open'));
      range.addEventListener('input', (e) => val.textContent = '$' + e.target.value);
  });
})();