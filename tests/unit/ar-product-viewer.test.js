import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ARProductViewer Unit Tests', () => {
  let ARProductViewer;
  let isARSupported;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="test-ar-container"></div>';
    const module = await import('../../js/ar-product-viewer.js');
    const exports = module.default || window.ARProductViewer;
    ARProductViewer = exports.ARProductViewer;
    isARSupported = exports.isARSupported;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly checks AR support capabilities', () => {
    expect(typeof isARSupported()).toBe('boolean');
  });

  it('renders interactive 3D viewer inside container', () => {
    const viewer = new ARProductViewer('#test-ar-container');
    const container = document.querySelector('#test-ar-container');

    expect(container.children.length).toBeGreaterThan(0);
    expect(container.querySelector('.ar-product-viewer-box')).not.toBeNull();
  });

  it('allows dynamic product texture color changing', () => {
    const viewer = new ARProductViewer('#test-ar-container');
    viewer.setProductColor('#ff0000');

    expect(viewer.currentColor).toBe('#ff0000');
  });

  it('converts hex colors to normalized RGB float arrays correctly', () => {
    const viewer = new ARProductViewer('#test-ar-container');
    const rgb = viewer.hexToRgb('#ffffff');

    expect(rgb).toEqual([1.0, 1.0, 1.0, 1.0]);
  });
});
