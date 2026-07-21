// Performance lazy loading initialization
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    // Prevent layout shift
    if (!img.style.aspectRatio && img.width && img.height) {
      img.style.aspectRatio = `${img.width} / ${img.height}`;
    }
  });
});
