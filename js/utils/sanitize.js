/**
 * Sanitize user input strings to prevent XSS payloads and HTML injection.
 * Escapes common HTML special characters and filters dangerous attributes.
 */
export function sanitizeHTML(input, options = {}) {
  if (typeof input !== 'string') {
    return input;
  }

  let whitelist = null;
  if (Array.isArray(options)) {
    whitelist = options.map(t => String(t).toLowerCase());
  } else if (options && Array.isArray(options.whitelist)) {
    whitelist = options.whitelist.map(t => String(t).toLowerCase());
  }

  let str = input;

  // Remove dangerous protocols
  str = str.replace(/(href|src|action|data)\s*=\s*(['"]?)\s*(javascript|data|vbscript):[^\s"'>]*/gi, '$1=$2#$2');
  str = str.replace(/javascript:/gi, '');
  str = str.replace(/data:[^\s"'>]*/gi, '');

  // Remove inline event handlers
  str = str.replace(/\s+on[a-z]+\s*=\s*(['"])(.*?)\1/gi, '');
  str = str.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');

  if (whitelist && whitelist.length > 0) {
    const tokens = [];

    // Protect whitelisted tags
    str = str.replace(/<([^>]+)>/g, (match, p1) => {
      const tagNameMatch = p1.match(/^\/?([a-z0-9]+)/i);
      if (tagNameMatch) {
        const tagName = tagNameMatch[1].toLowerCase();
        if (whitelist.includes(tagName)) {
          let safeTag = p1
            .replace(/\s+on[a-z]+\s*=\s*(['"])(.*?)\1/gi, '')
            .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
            .replace(/(href|src)\s*=\s*(['"]?)\s*(javascript|data|vbscript):[^\s"'>]*/gi, '$1=$2#$2')
            .replace(/\s+/g, ' ')
            .trim();
          const token = `___WHITELIST_TOKEN_${tokens.length}___`;
          tokens.push(`<${safeTag}>`);
          return token;
        }
      }
      return match;
    });

    if (options && options.stripTags) {
      str = str.replace(/<[^>]*>/g, '');
    }

    let clean = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    tokens.forEach((tok, idx) => {
      clean = clean.replace(`___WHITELIST_TOKEN_${idx}___`, tok);
    });

    return clean;
  }

  let clean = str
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
