// Script tag injection shield
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const textInputs = form.querySelectorAll(
      "input[type='text'], input[type='search'], input[type='url'], input[type='tel'], textarea",
    );
    let blocked = false;

    textInputs.forEach((input) => {
      const rawVal = input.value;
      // Skip empty inputs so valid blank fields are never cleared.
      if (!rawVal) return;
      // Check for script tag presence or onload handlers
      if (
        /<script/i.test(rawVal) ||
        /onload=/i.test(rawVal) ||
        /javascript:/i.test(rawVal)
      ) {
        blocked = true;
        input.value = '';
      } else if (
        typeof window !== 'undefined' &&
        typeof window.sanitizeHTML === 'function'
      ) {
        // Perform additional sanitization in-place
        input.value = window.sanitizeHTML(rawVal);
      }
    });

    if (blocked) {
      e.preventDefault();
      alert('Blocked potential Cross-Site Scripting input vector.');
    }
  });
});

function containsSqlInjectionKeywords(input) {
  if (!input || typeof input !== 'string') return false;
  return /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b/i.test(input);
}
