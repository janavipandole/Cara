// Client-Side Error Boundary and Logger
window.addEventListener('error', (event) => {
  console.error('Runtime exception caught: ', event.error);
  const errors = JSON.parse(localStorage.getItem('cara_runtime_errors')) || [];
  errors.push({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(
    'cara_runtime_errors',
    JSON.stringify(errors.slice(-10)),
  );

  // Display fallback crash notice if main app component fails
  if (event.filename.includes('app.js')) {
    const notice = document.createElement('div');
    notice.style.cssText =
      'position:fixed; top:0; left:0; width:100%; background:#e23e57; color:white; text-align:center; padding:10px; z-index:100000;';
    notice.innerHTML =
      'Oops! A client-side application error occurred. Some features might not respond. Please reload the page.';
    document.body.appendChild(notice);
  }
});
