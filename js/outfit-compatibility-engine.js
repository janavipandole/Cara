/**
 * Outfit Compatibility Recommendation Engine
 * Calculates item style match scores based on color harmony matrix, category balance, and aesthetic tags.
 */

class OutfitCompatibilityEngine {
  constructor() {
    this.colorHarmony = {
      white: ['black', 'blue', 'red', 'green', 'gray', 'denim'],
      black: ['white', 'red', 'yellow', 'gray', 'denim'],
      blue: ['white', 'black', 'beige', 'gray', 'tan'],
      red: ['black', 'white', 'navy'],
      green: ['white', 'beige', 'black']
    };
  }


  calculateTagScore(tags1 = [], tags2 = []) {
    if (!Array.isArray(tags1) || !Array.isArray(tags2) || tags1.length === 0 || tags2.length === 0) {
      return 0;
    }
    const set1 = new Set(tags1.map(t => String(t).toLowerCase()));
    const shared = tags2.filter(t => set1.has(String(t).toLowerCase()));
    return Math.round((shared.length / Math.max(tags1.length, tags2.length)) * 100);
  }

  evaluatePair(top, bottom) {
    if (!top || !bottom) return { score: 0, rating: 'Incomplete', feedback: 'Please select both a top and a bottom item.' };

    const topColor = (top.color || 'white').toLowerCase();
    const bottomColor = (bottom.color || 'black').toLowerCase();

    let score = 70; // baseline

    const harmonicColors = this.colorHarmony[topColor] || [];
    if (harmonicColors.includes(bottomColor) || topColor === bottomColor) {
      score += 20;
    }

    if (top.style && bottom.style && top.style.toLowerCase() === bottom.style.toLowerCase()) {
      score += 10;
    }

    score = Math.min(100, Math.max(0, score));

    let rating = 'Fair';
    if (score >= 90) rating = 'Perfect Match';
    else if (score >= 80) rating = 'Great Combination';
    else if (score >= 70) rating = 'Good Match';

    return {
      score,
      rating,
      feedback: `Color harmony between ${topColor} and ${bottomColor} scored ${score}%.`
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OutfitCompatibilityEngine;
} else {
  window.OutfitCompatibilityEngine = OutfitCompatibilityEngine;
}
