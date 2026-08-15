// Client-Side Error Boundary and Logger

// Internal silent logging hook — replace with window.CaraErrorLogger in future
const _logHook = function (msg, error) {
  // Silent by default — no console output in production builds.
  // Wire in a centralized logging service to capture these.
};

// At most one crash notice may ever be shown per page load. Without this
// flag, repeated app.js errors (e.g. one inside a loop) stack identical
// fixed-position banners that permanently cover the header.
let crashNoticeShown = false;

window.addEventListener('error', (event) => {
  _logHook('[error-logger] Runtime exception caught: ', event.error);
  let errors = [];
  try {
    errors = JSON.parse(localStorage.getItem('cara_runtime_errors')) || [];
  } catch (e) {
    // keep empty array if localStorage unavailable
    errors = [];
  }
  errors.push({
    message: String(event.message || '').slice(0, 2000),
    filename: String(event.filename || '').slice(0, 500),
    lineno: event.lineno,
    timestamp: new Date().toISOString(),
  });
  try {
    localStorage.setItem(
      'cara_runtime_errors',
      JSON.stringify(errors.slice(-10)),
    );
  } catch (e) {
    // Silently ignore if localStorage is unavailable
  }

  // Display fallback crash notice if main app component fails.
  // `filename` is optional on non-ErrorEvent `error` events, so normalise it
  // the same way it is normalised above before doing any string work.
  try {
    const sourceFile = String(event.filename || '');

    if (sourceFile.includes('app.js') && !crashNoticeShown && document.body) {
      crashNoticeShown = true;

      const notice = document.createElement('div');
      notice.id = 'cara-crash-notice';
      notice.setAttribute('role', 'alert');
      notice.style.cssText =
        'position:fixed; top:0; left:0; width:100%; background:#e23e57; color:white; text-align:center; padding:10px; z-index:100000;';
      notice.textContent =
        'Oops! A client-side application error occurred. Some features might not respond. Please reload the page.';

      const dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.textContent = '✕';
      dismiss.setAttribute('aria-label', 'Dismiss error notice');
      dismiss.style.cssText =
        'position:absolute; right:12px; top:50%; transform:translateY(-50%); background:transparent; border:none; color:white; font-size:16px; cursor:pointer;';
      dismiss.addEventListener('click', () => notice.remove());
      notice.appendChild(dismiss);

      document.body.appendChild(notice);
    }
  } catch (err) {
    // The global error handler must never throw — if the banner path fails
    // for any reason, swallow it so the original error stays visible.
    _logHook('[error-logger] Failed to render crash notice: ', err);
  }
});

export function getMaxLoggerQueueSize() {
  return 50;
}
