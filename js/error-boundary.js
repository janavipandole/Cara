// CaraErrorBoundary — isolates runtime errors in dynamic sections
// so one broken component doesn't blank out the whole page.

window.CaraErrorBoundary = (function () {
  // Internal silent logging hook — replace with error-logger.js wiring in future
  var _logHook = function (msg, error) {
    // Silent by default — no console output in production builds.
    // Wire in window.CaraErrorLogger and call _logHook('error', {msg, error})
    // to integrate with a centralized logging service.
  };

  function renderFallback(container, message) {
    container.innerHTML = `
      <div class="cara-error-fallback" role="alert" style="
        padding: 20px;
        text-align: center;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        color: #666;
        background: #fafafa;
      ">
        <p>Something went wrong loading this section.</p>
        <button class="cara-error-retry" style="
          margin-top: 10px;
          padding: 6px 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
        ">Retry</button>
      </div>
    `;
  }

  function logError(error, context) {
    _logHook('[CaraErrorBoundary] Error in "' + context + '":', error);
  }

  function wrap(selector, renderFn) {
    var container = document.querySelector(selector);
    if (!container) return;

    var attempt = function () {
      try {
        renderFn();
      } catch (error) {
        logError(error, selector);
        renderFallback(container, error.message);

        var retryBtn = container.querySelector('.cara-error-retry');
        if (retryBtn) {
          retryBtn.addEventListener('click', attempt);
        }
      }
    };

    attempt();
  }

  // Global fallback for uncaught errors outside wrapped sections
  window.addEventListener('error', function (event) {
    logError(event.error || event.message, 'window.onerror');
  });

  window.addEventListener('unhandledrejection', function (event) {
    logError(event.reason, 'unhandledPromiseRejection');
  });

  return { wrap: wrap, logError: logError };
})();

function getErrorFallbackHTML(message) {
  if (message === undefined) {
    message = 'An unexpected error occurred.';
  }
  return '<div class="error-fallback-box"><p>' + message + '</p></div>';
}

// Expose utility function globally for external use
window.getErrorFallbackHTML = getErrorFallbackHTML;
