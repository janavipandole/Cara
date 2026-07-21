/**
 * Outfit Compatibility and Fallback Suggester Utility
 * Evaluates whether clothing items match and provides alternative style suggestions.
 */
class OutfitCompatibility {
  constructor() {
    this.complementaryColors = {
      white: ['black', 'navy', 'red', 'green', 'blue'],
      black: ['white', 'red', 'navy', 'gray', 'pink'],
      blue: ['white', 'black', 'gray', 'khaki'],
      red: ['white', 'black', 'navy'],
      green: ['white', 'black', 'khaki', 'brown'],
      khaki: ['white', 'black', 'blue', 'green', 'navy'],
      navy: ['white', 'black', 'khaki', 'gray', 'pink']
    };
  }

  isColorCompatible(color1, color2) {
    if (!color1 || !color2) return true;
    const c1 = color1.toLowerCase().trim();
    const c2 = color2.toLowerCase().trim();
    if (c1 === c2) return true; // Monochromatic matches

    const matches = this.complementaryColors[c1] || [];
    return matches.includes(c2);
  }

  getRecommendedFallbacks(color) {
    if (!color) return ['white', 'black'];
    const cleanColor = color.toLowerCase().trim();
    return this.complementaryColors[cleanColor] || ['white', 'black'];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OutfitCompatibility };
} else if (typeof window !== 'undefined') {
  window.OutfitCompatibility = OutfitCompatibility;
}
