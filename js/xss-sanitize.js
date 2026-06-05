/**
 * Safely sanitizes user input strings to prevent DOM-based XSS vulnerability.
 * Escapes characters like <, >, &, ", ', and / to their safe HTML entities.
 */
function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, function (s) {
    return entityMap[s] || s;
  });
}

// Bind to window object for global availability in vanilla JS scripts
window.sanitizeHTML = sanitizeHTML;
