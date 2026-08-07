import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualStylistEngine } from '../../js/virtual-stylist-engine.js';

describe('VirtualStylistEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new VirtualStylistEngine();
  });

  it('should evaluate color compatibility accurately', () => {
    expect(engine.isColorCompatible('blue', 'white')).toBe(true);
    expect(engine.isColorCompatible('black', 'white')).toBe(true);
  });

  it('should compute high outfit scores for matching top and bottom apparel', () => {
    const top = { category: 'shirts', color: 'blue' };
    const bottom = { category: 'jeans', color: 'white' };
    const score = engine.calculateOutfitScore(top, bottom);
    expect(score).toBe(100);
  });

  it('should rank bottoms by recommendation score', () => {
    const top = { category: 'shirts', color: 'blue' };
    const bottoms = [
      { id: 'b1', category: 'pants', color: 'yellow' },
      { id: 'b2', category: 'jeans', color: 'white' }
    ];
    const ranked = engine.recommendBottoms(top, bottoms);
    expect(ranked[0].item.id).toBe('b2');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});
