// Script tag injection shield
function installInputShield() {
  // Prevent errors in non-browser environments (SSR/Node)
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  const form = document.querySelector('form');
  if (!form) return;

  // Prevent duplicate event listeners if this function is called more than once
  if (form.dataset.inputShieldInstalled === 'true') {
    return;
  }

  form.dataset.inputShieldInstalled = 'true';

  form.addEventListener('submit', (e) => {
    const textInputs = form.querySelectorAll(
      "input[type='text'], input[type='search'], input[type='url'], input[type='tel'], textarea"
    );

    let blocked = false;

    textInputs.forEach((input) => {
      const rawVal = input.value;

      // Skip empty inputs so valid blank fields are never cleared.
      if (!rawVal) return;

      // Detect common XSS injection patterns.
      const containsPotentialXSS =
        /<script\b[^>]*>/i.test(rawVal) ||
        /\bon\w+\s*=/i.test(rawVal) ||
        /javascript\s*:/i.test(rawVal);

      if (containsPotentialXSS) {
        blocked = true;

        // Clear potentially dangerous input.
        input.value = '';
        return;
      }

      // Perform additional sanitization when available.
      if (typeof window.sanitizeHTML === 'function') {
        input.value = window.sanitizeHTML(rawVal);
      }
    });

    if (blocked) {
      e.preventDefault();
      alert('Blocked potential Cross-Site Scripting input vector.');
    }
  });

  // Expose utility function globally for external use.
  window.containsSqlInjectionKeywords = containsSqlInjectionKeywords;
}

// Safely initialize the input shield in browser environments.
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installInputShield, {
      once: true,
    });
  } else {
    installInputShield();
  }
}

/**
 * Performs a basic check for common SQL keywords.
 *
 * Note:
 * This is only a client-side detection helper and must NOT
 * be considered a replacement for parameterized queries,
 * prepared statements, or server-side validation.
 */
function containsSqlInjectionKeywords(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b/i.test(input);
}

export function getInputShieldStatusHelper36() {
  return {
    status: 'ok',
    fn: 'getInputShieldStatusHelper36',
  };
}