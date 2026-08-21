// Blog Page Reading Scroll Bar Tracker
document.addEventListener('DOMContentLoaded', () => {
  // Create progress bar element
  const progressBar = document.createElement('div');
  progressBar.id = 'reading-progress-bar';
  progressBar.style.cssText =
    'position:fixed; top:0; left:0; height:4px; background:#088178; width:0%; z-index:99999; transition:width 0.1s ease;';
  document.body.appendChild(progressBar);

  // Calculate reading scroll progress
  window.addEventListener('scroll', () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    progressBar.style.width = scrolled + '%';
  });

  // Add estimated read time to blog posts
  const posts = document.querySelectorAll('.blog-box');
  posts.forEach((post) => {
    const details = post.querySelector('.blog-details');
    if (details) {
      const textContent = details.textContent || '';
      const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
      const readTime = Math.ceil(wordCount / 200); // 200 words per min avg

      // Guard: do not render "0 min read" for empty or whitespace-only content
      if (!readTime || Number.isNaN(readTime)) return;

      const timeTag = document.createElement('span');
      timeTag.style.cssText =
        'font-size:11px; font-weight:700; color:#088178; display:block; margin-top:6px; text-transform:uppercase;';
      timeTag.innerHTML = `<i class="ri-time-line"></i> ${readTime} Min Read`;
      details.insertBefore(timeTag, details.firstChild);
    }
  });
});

// ── roundScrollProgressPercent ──────────────────────────────────────────────
// Rounds a raw scroll-progress percentage (e.g. 45.678) to the nearest integer
// for clean DOM display.
export function roundScrollProgressPercent(rawPercent) {
  if (typeof rawPercent !== 'number' || Number.isNaN(rawPercent)) return 0;
  return Math.round(Math.max(0, Math.min(100, rawPercent)));
}

window.getReadingProgressStatusHelper110 = function() {
  return {
    status: 'active',
    module: 'ReadingProgress',
    helper: 'getReadingProgressStatusHelper110'
  };
};
