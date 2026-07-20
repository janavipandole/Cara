// CaraErrorBoundary — isolates runtime errors in dynamic sections
// so one broken component doesn't blank out the whole page.

const CaraErrorBoundary = (function () {
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
    console.error(`[CaraErrorBoundary] Error in "${context}":`, error);
    // Hook point for future logging service integration
  }

  function wrap(selector, renderFn) {
    const container = document.querySelector(selector);
    if (!container) return;

    const attempt = () => {
      try {
        renderFn();
      } catch (error) {
        logError(error, selector);
        renderFallback(container, error.message);

        const retryBtn = container.querySelector('.cara-error-retry');
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

  return { wrap, logError };
})();