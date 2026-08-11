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

  /**
   * Checks whether a total outfit price is within a given budget.
   * @param {number} totalPrice
   * @param {number} budget
   * @returns {boolean}
   */
  isOutfitWithinBudget(totalPrice, budget) {
    if (typeof totalPrice !== 'number' || Number.isNaN(totalPrice)) return false;
    if (typeof budget !== 'number' || Number.isNaN(budget) || budget < 0) return true; // no limit
    return totalPrice <= budget;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OutfitCompatibility };
} else if (typeof window !== 'undefined') {
  window.OutfitCompatibility = OutfitCompatibility;
}


export function getOutfitCompatibilityStatusHelper49() {
  return { status: "ok", fn: "getOutfitCompatibilityStatusHelper49" };
}
