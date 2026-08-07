import { describe, it, expect, beforeEach } from 'vitest';
const OutfitCompatibilityEngine = require('../../js/outfit-compatibility-engine.js');

describe('OutfitCompatibilityEngine Unit Tests', () => {
  let engine;

  beforeEach(() => {
    engine = new OutfitCompatibilityEngine();
  });

  it('should handle incomplete selections gracefully', () => {
    const res = engine.evaluatePair(null, { color: 'black' });
    expect(res.score).toBe(0);
    expect(res.rating).toBe('Incomplete');
  });

  it('should score harmonic color combinations highly', () => {
    const top = { color: 'white', style: 'casual' };
    const bottom = { color: 'denim', style: 'casual' };
    const res = engine.evaluatePair(top, bottom);
    expect(res.score).toBe(100);
    expect(res.rating).toBe('Perfect Match');
  });

  it('should evaluate non-harmonic colors with lower scores', () => {
    const top = { color: 'red', style: 'casual' };
    const bottom = { color: 'green', style: 'formal' };
    const res = engine.evaluatePair(top, bottom);
    expect(res.score).toBeLessThan(90);
  });

  it('should calculate tag intersection compatibility score correctly', () => {
    const score = engine.calculateTagScore(['casual', 'summer', 'denim'], ['casual', 'summer']);
    expect(score).toBe(67);
  });

  it('should return 0 for empty or invalid tag inputs', () => {
    expect(engine.calculateTagScore([], ['casual'])).toBe(0);
    expect(engine.calculateTagScore(['casual'], [])).toBe(0);
    expect(engine.calculateTagScore(null, ['casual'])).toBe(0);
    expect(engine.calculateTagScore('not-array', ['casual'])).toBe(0);
  });

  it('should match tags case-insensitively', () => {
    expect(engine.calculateTagScore(['Casual', 'SUMMER'], ['casual', 'summer'])).toBe(100);
  });

  it('should apply default colors when an item has none', () => {
    const res = engine.evaluatePair({}, {});
    expect(res.score).toBe(90); // 70 baseline + 20 (white/black harmony)
    expect(res.rating).toBe('Perfect Match');
  });

  it('should add a style-match bonus for matching styles', () => {
    const top = { color: 'white', style: 'formal' };
    const bottom = { color: 'green', style: 'formal' };
    const res = engine.evaluatePair(top, bottom);
    // 70 baseline + 20 harmony (white<->green) + 10 style = 100
    expect(res.score).toBe(100);
  });
});
