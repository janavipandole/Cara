(function () {
  'use strict';

  const CaraSanitize = {
    escapeHTML(str) {
      if (typeof str !== 'string') return str;
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    },

    sanitizeInput(str) {
      if (typeof str !== 'string') return str;
      return this.escapeHTML(str.trim());
    },

    validateEmail(email) {
      if (typeof email !== 'string') return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email.trim());
    },
  };

  window.CaraSanitize = CaraSanitize;
})();
