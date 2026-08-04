// Script tag injection shield
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const textInputs = form.querySelectorAll("input[type='text'], input[type='search'], input[type='url'], input[type='tel'], textarea");
    let blocked = false;

    textInputs.forEach((input) => {
      const rawVal = input.value;
      // Check for script tag presence, event handlers, or dangerous URL patterns
      if (
        /<script/i.test(rawVal) ||
        /onload=/i.test(rawVal) ||
        /javascript:/i.test(rawVal) ||
        /onerror=/i.test(rawVal) ||
        /onclick=/i.test(rawVal) ||
        /onfocus=/i.test(rawVal) ||
        /onblur=/i.test(rawVal) ||
        /onchange=/i.test(rawVal) ||
        /onkeydown=/i.test(rawVal) ||
        /onkeyup=/i.test(rawVal) ||
        /onmouseover=/i.test(rawVal) ||
        /onmouseout=/i.test(rawVal) ||
        /onload\s/i.test(rawVal) ||
        /onload$/i.test(rawVal)
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
