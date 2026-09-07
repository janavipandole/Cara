/**
 * Virtual Stylist & Outfit Recommendation Engine
 * Pairs tops, bottoms, and footwear while evaluating color compatibility, occasion filtering, and generating complete ensembles.
 */
export class VirtualStylistEngine {
  constructor(options = {}) {
    this.colorHarmonies = {
      black: ['white', 'red', 'blue', 'beige', 'grey', 'yellow'],
      white: ['black', 'blue', 'red', 'green', 'brown'],
      blue: ['white', 'beige', 'grey', 'yellow'],
      beige: ['black', 'blue', 'white', 'brown']
    };
  }

  isColorCompatible(colorA = '', colorB = '') {
    const c1 = colorA.toLowerCase();
    const c2 = colorB.toLowerCase();
    if (c1 === c2) return true;
    if (this.colorHarmonies[c1] && this.colorHarmonies[c1].includes(c2)) return true;
    if (this.colorHarmonies[c2] && this.colorHarmonies[c2].includes(c1)) return true;

    // Fall back to default palette for neutral / unknown colors: black, white, grey
    const defaultAllowed = ['black', 'white', 'grey', 'gray'];
    return defaultAllowed.includes(c1) || defaultAllowed.includes(c2);
  }

  getColorCompatibility(colorA = '', colorB = '') {
    const c1 = colorA.toLowerCase();
    const c2 = colorB.toLowerCase();
    
    if (c1 === c2) return 0.8; // Same color match
    if (this.colorHarmonies[c1] && this.colorHarmonies[c1].includes(c2)) return 1.0;
    if (this.colorHarmonies[c2] && this.colorHarmonies[c2].includes(c1)) return 1.0;
    
    const defaultAllowed = ['black', 'white', 'grey', 'gray'];
    if (defaultAllowed.includes(c1) || defaultAllowed.includes(c2)) return 0.8;

    return 0.5; // Neutral default
  }

  calculateOutfitScore(topItem, bottomItem, footwearItem = null) {
    if (!topItem || !bottomItem) return 0;

    let score = 30; // Base score

    // Color harmony score (0 - 30 pts)
    const topBottomColorScore = this.getColorCompatibility(topItem.color, bottomItem.color);
    score += topBottomColorScore * 30;

    // Optional footwear harmony bonus
    if (footwearItem) {
      const topFootwearScore = this.getColorCompatibility(topItem.color, footwearItem.color);
      const bottomFootwearScore = this.getColorCompatibility(bottomItem.color, footwearItem.color);
      score += ((topFootwearScore + bottomFootwearScore) / 2) * 20;
    }

    // Category style match bonus (0 - 20 pts)
    if (topItem.style && bottomItem.style && topItem.style.toLowerCase() === bottomItem.style.toLowerCase()) {
      score += 20;
    }

    return Math.min(100, Math.round(score));
  }

  recommendBottoms(selectedTop, availableBottoms = [], occasion = null) {
    if (!selectedTop || !availableBottoms.length) return [];

    let candidates = [...availableBottoms];
    if (occasion) {
      candidates = candidates.filter(b => b.occasion && b.occasion.toLowerCase() === occasion.toLowerCase());
    }

    return candidates
      .map(bottom => ({
        bottom,
        compatibilityScore: this.calculateOutfitScore(selectedTop, bottom)
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }

  generateFullEnsemble(topItem, availableBottoms = [], availableFootwear = [], occasion = null) {
    const bottomRecs = this.recommendBottoms(topItem, availableBottoms, occasion);
    if (!bottomRecs.length) return null;

    const bestBottom = bottomRecs[0].bottom;
    
    let bestFootwear = null;
    let highestScore = 0;

    if (availableFootwear && availableFootwear.length > 0) {
      availableFootwear.forEach(shoe => {
        const score = this.calculateOutfitScore(topItem, bestBottom, shoe);
        if (score > highestScore) {
          highestScore = score;
          bestFootwear = shoe;
        }
      });
    } else {
      highestScore = bottomRecs[0].compatibilityScore;
    }

    return {
      top: topItem,
      bottom: bestBottom,
      footwear: bestFootwear,
      totalScore: highestScore
    };
  }
}


export function getVirtualStylistEngineStatusHelper88() {
  return { status: "ok", fn: "getVirtualStylistEngineStatusHelper88" };
}
