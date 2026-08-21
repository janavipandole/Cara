/**
 * Image Zoom on Hover — magnifying-glass effect for the main product image.
 * Wires into #MainImg on singleProduct.html. Tracks the cursor position and
 * scales the image with a matching transform-origin so the hovered region
 * is magnified inline. Disabled on touch/coarse-pointer devices (where the
 * browser's native pinch-zoom is the expected behaviour) and when the user
 * prefers reduced motion.
 */
(function () {
  'use strict';

  const ZOOM_SCALE = 2;
  const MAIN_IMG_ID = 'MainImg';

  function isTouchDevice() {
    return (
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function initImageZoom() {
    if (isTouchDevice() || prefersReducedMotion()) return;

    const img = document.getElementById(MAIN_IMG_ID);
    if (!img) return;

    // Skip if already initialised or if the image has no src.
    if (img.dataset.zoomInit === '1' || !img.src) return;

    const container = img.parentElement;
    if (!container) return;

    img.dataset.zoomInit = '1';
    container.classList.add('image-zoom-container');
    img.classList.add('image-zoom-target');

    const lens = document.createElement('div');
    lens.className = 'image-zoom-lens';
    lens.setAttribute('aria-hidden', 'true');
    container.appendChild(lens);

    function moveLens(e) {
      const rect = img.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Position the lens so it follows the cursor and stays within bounds.
      const lensSize = lens.offsetWidth;
      let lensX = x - lensSize / 2;
      let lensY = y - lensSize / 2;

      const maxX = rect.width - lensSize;
      const maxY = rect.height - lensSize;
      lensX = Math.max(0, Math.min(lensX, maxX));
      lensY = Math.max(0, Math.min(lensY, maxY));

      lens.style.left = lensX + 'px';
      lens.style.top = lensY + 'px';

      // Magnify the region under the lens using the high-res source.
      const bgX = (lensX / rect.width) * 100;
      const bgY = (lensY / rect.height) * 100;
      lens.style.backgroundImage = `url("${img.src}")`;
      lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
      lens.style.backgroundSize = `${rect.width * ZOOM_SCALE}px ${rect.height * ZOOM_SCALE}px`;
    }

    function showLens() {
      lens.style.opacity = '1';
      img.style.opacity = '0.3';
    }

    function hideLens() {
      lens.style.opacity = '0';
      img.style.opacity = '1';
    }

    container.addEventListener('mousemove', moveLens);
    container.addEventListener('mouseenter', showLens);
    container.addEventListener('mouseleave', hideLens);

    // Update the high-res source when the main image swaps (thumbnail click).
    const observer = new MutationObserver(() => {
      if (img.src && lens.style.backgroundImage.indexOf(img.src) === -1) {
        lens.style.backgroundImage = `url("${img.src}")`;
      }
    });
    observer.observe(img, { attributes: true, attributeFilter: ['src'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageZoom);
  } else {
    initImageZoom();
  }

  // Re-init when the product image is swapped dynamically.
  window.addEventListener('load', initImageZoom);
})();
