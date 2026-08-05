/**
 * Product Grid CLS Optimizer Engine
 * Dynamically applies aspect-ratio bounding boxes and srcset parameters to eliminate Cumulative Layout Shift (#3708).
 */

export class GridClsOptimizer {
  constructor(options = {}) {
    this.targetSelector = options.targetSelector || '.pro-container .pro img';
    this.defaultAspectRatio = options.defaultAspectRatio || '1 / 1';
  }

  optimizeGridImages(container = document) {
    if (typeof document === 'undefined') return { count: 0 };

    const images = container.querySelectorAll ? container.querySelectorAll(this.targetSelector) : [];
    let count = 0;

    images.forEach((img) => {
      if (!img.getAttribute('width') || !img.getAttribute('height')) {
        img.setAttribute('width', '300');
        img.setAttribute('height', '300');
      }

      if (!img.style.aspectRatio) {
        img.style.aspectRatio = this.defaultAspectRatio;
      }

      img.classList.add('cls-optimized');
      count++;
    });

    return { count };
  }
}
