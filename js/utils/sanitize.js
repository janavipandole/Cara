/**
 * Sanitize user input strings to prevent XSS payloads and HTML injection.
 * Escapes common HTML special characters and filters dangerous attributes.
 */
export function sanitizeHTML(input) {
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

  return clean;
}

export function sanitizeDOMNode(element) {
  if (!element || typeof element.querySelectorAll !== 'function') return;
  const scriptTags = element.querySelectorAll('script, iframe, object, embed');
  scriptTags.forEach((tag) => tag.remove());
}

if (typeof window !== 'undefined') {
  window.sanitizeHTML = sanitizeHTML;
}
