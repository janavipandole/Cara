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
});
