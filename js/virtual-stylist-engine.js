/**
 * Virtual Stylist & Outfit Recommendation Engine
 * Computes color compatibility scores, style harmony, and generates complete outfit ensembles.
 */

export class VirtualStylistEngine {
  constructor() {
    this.colorPalettes = {
      blue: ['white', 'grey', 'black', 'beige'],
      black: ['white', 'red', 'grey', 'blue', 'yellow'],
      white: ['black', 'blue', 'red', 'green', 'brown'],
      red: ['black', 'white', 'navy']
    };
  }

  isColorCompatible(colorA = '', colorB = '') {
    const c1 = colorA.toLowerCase().trim();
    const c2 = colorB.toLowerCase().trim();
    if (c1 === c2) return true;
    const compatibleList = this.colorPalettes[c1] || ['black', 'white', 'grey'];
    return compatibleList.includes(c2);
  }

  calculateOutfitScore(topItem, bottomItem) {
    if (!topItem || !bottomItem) return 0;
    let score = 50; // base score

    // Category check
    if (topItem.category === 'tshirts' || topItem.category === 'shirts') {
      if (bottomItem.category === 'pants' || bottomItem.category === 'jeans') {
        score += 30;
      }
    }

    // Color harmony
    if (this.isColorCompatible(topItem.color, bottomItem.color)) {
      score += 20;
    }
    return Math.min(100, score);
  }

  recommendBottoms(topItem, catalogBottoms = []) {
    if (!topItem || !Array.isArray(catalogBottoms)) return [];

    return catalogBottoms
      .map(bottom => ({
        item: bottom,
        score: this.calculateOutfitScore(topItem, bottom)
      }))
      .sort((a, b) => b.score - a.score);
  }
}
