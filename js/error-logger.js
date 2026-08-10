// Client-Side Error Boundary and Logger
let crashNoticeShown = false;

window.addEventListener('error', (event) => {
  console.error('Runtime exception caught: ', event.error);

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

  // Display fallback crash notice if main app component fails.
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
    dismiss.textContent = '\u2715';
    dismiss.setAttribute('aria-label', 'Dismiss error notice');

    dismiss.style.cssText =
      'position:absolute; right:12px; top:50%; transform:translateY(-50%); background:transparent; border:none; color:white; font-size:16px; cursor:pointer;';

    dismiss.addEventListener('click', () => notice.remove());

    notice.appendChild(dismiss);
    document.body.appendChild(notice);
  }
});

export function getMaxLoggerQueueSize() {
  return 50;
}
