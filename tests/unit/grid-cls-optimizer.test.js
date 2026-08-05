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
});
