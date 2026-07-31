/**
 * Wrapper around fetch() that aborts the request after `ms` milliseconds.
 * Throws a DOMException with name "AbortError" on timeout.
 *
 * @param {string|URL} url
 * @param {RequestInit} [options]
 * @param {number} [ms=10000]
 * @returns {Promise<Response>}
 */
function fetchWithTimeout(url, options = {}, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  const finalOptions = {
    credentials: 'include',
    ...options,
    signal: controller.signal,
  };
  return fetch(url, finalOptions).finally(() => clearTimeout(timer));
}

// Allow import in test / Node environments
if (typeof module !== 'undefined') {
  module.exports = { fetchWithTimeout };
}
