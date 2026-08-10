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

  it('should treat color comparison as case-insensitive and trimmed', () => {
    expect(engine.isColorCompatible('  BLUE ', 'white')).toBe(true);
    expect(engine.isColorCompatible('Blue', 'WHITE')).toBe(true);
  });

  it('should return true for identical colors', () => {
    expect(engine.isColorCompatible('red', 'red')).toBe(true);
    expect(engine.isColorCompatible('', '')).toBe(true);
  });

  it('should return 0 when either outfit item is missing', () => {
    expect(engine.calculateOutfitScore(null, { category: 'jeans' })).toBe(0);
    expect(engine.calculateOutfitScore({ category: 'shirts' }, null)).toBe(0);
  });

  it('should cap outfit scores at 100', () => {
    const top = { category: 'shirts', color: 'blue' };
    const bottom = { category: 'pants', color: 'white' };
    // base 50 + 30 category + 20 color = 100 (capped)
    expect(engine.calculateOutfitScore(top, bottom)).toBe(100);
  });

  it('should return an empty list for invalid catalog input', () => {
    const top = { category: 'shirts', color: 'blue' };
    expect(engine.recommendBottoms(top, null)).toEqual([]);
    expect(engine.recommendBottoms(top, 'not-an-array')).toEqual([]);
    expect(engine.recommendBottoms(null, [])).toEqual([]);
  });

  it('should return an empty list for an empty catalog', () => {
    const top = { category: 'shirts', color: 'blue' };
    expect(engine.recommendBottoms(top, [])).toEqual([]);
  });

  it('should fall back to the default palette for unknown colors', () => {
    // 'purple' is not a palette key; black, white, and grey are allowed.
    expect(engine.isColorCompatible('purple', 'white')).toBe(true);
    expect(engine.isColorCompatible('purple', 'black')).toBe(true);
    expect(engine.isColorCompatible('purple', 'orange')).toBe(false);
  });
});
