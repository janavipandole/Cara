import { describe, it, expect, beforeEach } from 'vitest';
const VirtualTryOnEngine = require('../../js/virtual-tryon-engine.js');

describe('VirtualTryOnEngine Unit Tests', () => {
  let engine;

  beforeEach(() => {
    engine = new VirtualTryOnEngine();
  });

  it('should initialize with default transformation state', () => {
    const transform = engine.updateTransform({});
    expect(transform.scale).toBe(1.0);
    expect(transform.rotation).toBe(0);
  });

  it('should clamp scale within range [0.2, 3.0]', () => {
    const resUnder = engine.updateTransform({ scale: 0.05 });
    expect(resUnder.scale).toBe(0.2);

    const resOver = engine.updateTransform({ scale: 5.0 });
    expect(resOver.scale).toBe(3.0);
  });

  it('should calculate garment bounding coordinates correctly', () => {
    engine.updateTransform({ scale: 2.0, offsetX: 10, offsetY: 20 });
    const bounds = engine.calculateGarmentBounds(400, 600, 100, 150);

    expect(bounds.width).toBe(200);
    expect(bounds.height).toBe(300);
    expect(bounds.centerX).toBe(210);
    expect(bounds.centerY).toBe(320);
  });

  it('should ignore non-finite offsets and scale values', () => {
    const res = engine.updateTransform({
      scale: NaN,
      offsetX: NaN,
      offsetY: Infinity,
    });
    expect(res.scale).toBe(1.0);
    expect(res.position.x).toBe(0);
    expect(res.position.y).toBe(0);
  });

  it('should normalize negative rotations to a positive angle', () => {
    const res = engine.updateTransform({ rotation: -90 });
    expect(res.rotation).toBe(270);
  });
});
