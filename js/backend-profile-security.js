/**
 * Profile Field Validation and Hardening Utility
 * Hardens profile editing inputs against injection and invalid formats.
 */
class BackendProfileSecurity {
  sanitizeField(value) {
    if (!value || typeof value !== 'string') return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  validateEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim().toLowerCase());
  }

  validatePhone(phone) {
    if (!phone) return true; // Phone is optional in profile
    const re = /^\+?[\d\s-]{8,15}$/;
    return re.test(String(phone).trim());
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackendProfileSecurity };
} else if (typeof window !== 'undefined') {
  window.BackendProfileSecurity = BackendProfileSecurity;
}
