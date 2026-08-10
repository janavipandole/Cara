/**
 * Cara Premium Component Logic: Responsive Hamburger Menu
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Responsive Hamburger Menu component demo initialized.');
    const burger = document.getElementById('hamburger');
      const drawer = document.getElementById('mobileDrawer');
      burger.addEventListener('click', () => drawer.classList.toggle('open'));
  });
})();