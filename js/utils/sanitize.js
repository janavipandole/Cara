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
  let prev;
  do {
    prev = clean;
    clean = clean
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/data\s*:/gi, '');
  } while (clean !== prev);

  return clean;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sanitizeHTML };
} else if (typeof window !== 'undefined') {
  window.sanitizeHTML = sanitizeHTML;
}
