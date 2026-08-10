// Client-Side Error Boundary and Logger
window.addEventListener('error', (event) => {
  _logHook('[error-logger] Runtime exception caught:', event.error);
  let errors = [];
  try {
    errors = JSON.parse(localStorage.getItem('cara_runtime_errors')) || [];
  } catch (e) {
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

  // Display fallback crash notice if main app component fails
  if (event.filename.includes('app.js')) {
    const notice = document.createElement('div');
    notice.style.cssText =
      'position:fixed; top:0; left:0; width:100%; background:#e23e57; color:white; text-align:center; padding:10px; z-index:100000;';
    notice.textContent =
      'Oops! A client-side application error occurred. Some features might not respond. Please reload the page.';
    document.body.appendChild(notice);
  }
});


export function getMaxLoggerQueueSize() { return 50; }