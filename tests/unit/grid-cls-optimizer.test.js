import { describe, it, expect, beforeEach } from 'vitest';
import { GridClsOptimizer } from '../../js/grid-cls-optimizer.js';

describe('GridClsOptimizer Unit Tests', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new GridClsOptimizer();
  });

  it('should initialize with default aspect ratio settings', () => {
    expect(optimizer.defaultAspectRatio).toBe('1 / 1');
  });

  it('should optimize images by setting width, height, and aspect-ratio style', () => {
    const mockImg = {
      attributes: {},
      style: {},
      classList: {
        add: (cls) => { mockImg.classList[cls] = true; },
      },
      getAttribute: (attr) => mockImg.attributes[attr],
      setAttribute: (attr, val) => { mockImg.attributes[attr] = val; },
    };

    const mockContainer = {
      querySelectorAll: () => [mockImg],
    };

    const res = optimizer.optimizeGridImages(mockContainer);
    expect(res.count).toBe(1);
    expect(mockImg.attributes.width).toBe('300');
    expect(mockImg.attributes.height).toBe('300');
    expect(mockImg.style.aspectRatio).toBe('1 / 1');
    expect(mockImg.classList['cls-optimized']).toBe(true);
  });

  it('should cleanup reserved dimensions for completed images', () => {
    const img = document.createElement('img');
    img.className = 'cls-optimized';
    Object.defineProperty(img, 'complete', { value: true });
    const mockContainer = {
      querySelectorAll: () => [img]
    };
    const res = optimizer.cleanupReservedDimensions(mockContainer);
    expect(res.cleaned).toBe(1);
    expect(img.classList.contains('cls-optimized')).toBe(false);
  });

  it('should not throw when document is undefined (non-DOM environment)', async () => {
    // Temporarily hide the global document to simulate a non-DOM environment.
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', { value: undefined, writable: true, configurable: true });
    try {
      const res = optimizer.cleanupReservedDimensions();
      expect(res.cleaned).toBe(0);
      const optRes = optimizer.optimizeGridImages();
      expect(optRes.count).toBe(0);
    } finally {
      Object.defineProperty(globalThis, 'document', { value: originalDocument, writable: true, configurable: true });
    }
  });

});
