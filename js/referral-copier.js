(function () {
  'use strict';
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy-referral]');
    if (!btn) return;
    const text = btn.getAttribute('data-copy-referral');
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const prev = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = prev; }, 1500);
  });
})();
