(function () {
  'use strict';
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-share-product]');
    if (!btn) return;
    const data = {
      title: btn.getAttribute('data-share-title') || document.title,
      text: btn.getAttribute('data-share-text') || '',
      url: btn.getAttribute('data-share-url') || location.href,
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch (err) {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(data.url);
      const prev = btn.textContent;
      btn.textContent = 'Link copied';
      setTimeout(() => { btn.textContent = prev; }, 1500);
    }
  });
})();
