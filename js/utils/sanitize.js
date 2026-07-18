/**
 * Sanitize user input strings to prevent XSS payloads and HTML injection.
 * Escapes common HTML special characters and filters dangerous attributes.
 */
function sanitizeHTML(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Escape HTML characters
  let clean = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Prevent inline event handlers and scripting attributes
  clean = clean.replace(/on\w+\s*=/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  clean = clean.replace(/data\s*:/gi, '');

  return clean;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sanitizeHTML };
} else if (typeof window !== 'undefined') {
  window.sanitizeHTML = sanitizeHTML;
}
