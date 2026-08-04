// Script tag injection shield
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const textInputs = form.querySelectorAll("input[type='text'], input[type='search'], input[type='url'], input[type='tel'], textarea");
    let blocked = false;

    textInputs.forEach((input) => {
      const rawVal = input.value;
      // Block script tags, all HTML event handler attributes, and javascript: URIs
      if (
        /<script/i.test(rawVal) ||
        /\bon(load|error|click|focus|blur|mouseover|mouseout|keypress|change|input|submit)[=>\s]/i.test(rawVal) ||
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
