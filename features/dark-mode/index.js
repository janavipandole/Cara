/**
 * Cara Premium Component Logic: Dark Mode Theme Toggle
 * Author: Cara Contributors
 */
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Dark Mode Theme Toggle component demo initialized.');
    const button = document.getElementById('themeToggleBtn');
      button.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        console.log('Theme toggled');
      });
  });
})();