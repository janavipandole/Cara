/**
 * Client-Side XSS Input Sanitizer
 */
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}
window.sanitizeInput = sanitizeInput;
