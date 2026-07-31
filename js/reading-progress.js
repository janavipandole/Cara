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
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });

  // Add estimated read time to blog posts
  const posts = document.querySelectorAll('.blog-box');
  posts.forEach((post) => {
    const details = post.querySelector('.blog-details');
    if (details) {
      const textContent = details.innerText;
      const wordCount = textContent.split(/\\s+/).length;
      const readTime = Math.ceil(wordCount / 200); // 200 words per min avg

      const timeTag = document.createElement('span');
      timeTag.style.cssText =
        'font-size:11px; font-weight:700; color:#088178; display:block; margin-top:6px; text-transform:uppercase;';
      timeTag.innerHTML = `<i class="ri-time-line"></i> ${readTime} Min Read`;
      details.insertBefore(timeTag, details.firstChild);
    }
  });
});
