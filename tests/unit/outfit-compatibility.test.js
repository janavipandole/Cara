import { describe, it, expect } from 'vitest';
import { OutfitCompatibility } from '../../js/outfit-compatibility.js';

describe('js/outfit-compatibility.js OutfitCompatibility tests', () => {
  const compatibility = new OutfitCompatibility();

  it('should treat missing colors as compatible', () => {
    expect(compatibility.isColorCompatible(null, 'white')).toBe(true);
    expect(compatibility.isColorCompatible('red', undefined)).toBe(true);
  });

  it('should match identical colors (monochromatic matching)', () => {
    expect(compatibility.isColorCompatible('red', 'red')).toBe(true);
    expect(compatibility.isColorCompatible('Black', 'black')).toBe(true);
  });

  it('should correctly evaluate color compatibility pairs', () => {
    expect(compatibility.isColorCompatible('white', 'black')).toBe(true);
    expect(compatibility.isColorCompatible('navy', 'pink')).toBe(true);
    expect(compatibility.isColorCompatible('red', 'green')).toBe(false);
  });

  it('should recommend fallbacks for a given color', () => {
    expect(compatibility.getRecommendedFallbacks('red')).toEqual(['white', 'black', 'navy']);
    expect(compatibility.getRecommendedFallbacks('nonexistent')).toEqual(['white', 'black']);
  });


  it('should return true when outfit is within budget', () => {
    const c = new OutfitCompatibility();
    expect(c.isOutfitWithinBudget(80, 100)).toBe(true);
    expect(c.isOutfitWithinBudget(100, 100)).toBe(true); // inclusive
  });

  it('should return false when outfit exceeds budget', () => {
    const c = new OutfitCompatibility();
    expect(c.isOutfitWithinBudget(150, 100)).toBe(false);
  });

  it('should return true when budget is undefined (no limit)', () => {
    const c = new OutfitCompatibility();
    expect(c.isOutfitWithinBudget(9999, undefined)).toBe(true);
    expect(c.isOutfitWithinBudget(9999, NaN)).toBe(true);
  });

  it('should return false for a NaN total price', () => {
    const c = new OutfitCompatibility();
    expect(c.isOutfitWithinBudget(NaN, 100)).toBe(false);
    expect(c.isOutfitWithinBudget('80', 100)).toBe(false);
  });

  it('should treat a negative budget as no limit', () => {
    const c = new OutfitCompatibility();
    expect(c.isOutfitWithinBudget(500, -1)).toBe(true);
  });

  it('should return default fallbacks for missing colors', () => {
    expect(compatibility.getRecommendedFallbacks(null)).toEqual(['white', 'black']);
    expect(compatibility.getRecommendedFallbacks('')).toEqual(['white', 'black']);
  });

  it('should trim whitespace from color names', () => {
    expect(compatibility.isColorCompatible('  white  ', 'black')).toBe(true);
    expect(compatibility.isColorCompatible('red', '  navy  ')).toBe(true);
  });

  it('should handle empty string colors as compatible', () => {
    expect(compatibility.isColorCompatible('', 'white')).toBe(true);
  });
});
