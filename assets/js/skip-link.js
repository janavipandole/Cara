// Skip link focus helper
document.addEventListener('DOMContentLoaded', () => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-to-content-btn';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.cssText =
    'position:absolute;top:-100px;left:20px;background:#088178;color:#fff;padding:10px 20px;z-index:99999;transition:top 0.2s;text-decoration:none;border-radius:4px;font-weight:600;';

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '20px';
  });
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-100px';
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
});

// Focus listener positioning bypass button visible upon keyboard tab event.
