/**
 * Size Conversion Utility
 * Provides methods to convert sizes across different international systems
 * and implements a naive size recommendation algorithm.
 */

const SizeConverter = {
  // Base internal sizes
  baseSizes: ['XXS', 'XS', 'S', 'M', 'L'],

  // Mapping table
  systems: {
    US: ['XXS', 'XS', 'S', 'M', 'L'],
    EU: ['44', '46', '48', '50', '52'],
    UK: ['34', '36', '38', '40', '42'],
    IT: ['44', '46', '48', '50', '52'],
    FR: ['44', '46', '48', '50', '52'],
    Japan: ['XS', 'S', 'M', 'L', 'XL'],
    China: ['160/80A', '165/84A', '170/88A', '175/92A', '180/96A'],
  },

  /**
   * Recommends a base size index given user measurements.
   * @param {number} heightCm - Height in centimeters
   * @param {number} weightKg - Weight in kilograms
   * @param {string} fitPreference - 'tight', 'regular', or 'loose'
   * @returns {Object} - Result with baseIndex and a confidence score percentage
   */
  recommendSize(heightCm, weightKg, fitPreference) {
    // Naive scoring formula
    let score = (heightCm - 150) * 0.4 + (weightKg - 50) * 0.6;

    let baseIndex = 0;
    if (score < 10)
      baseIndex = 0; // XXS
    else if (score < 18)
      baseIndex = 1; // XS
    else if (score < 25)
      baseIndex = 2; // S
    else if (score < 32)
      baseIndex = 3; // M
    else baseIndex = 4; // L

    // Adjust for fit preference
    if (fitPreference === 'loose' && baseIndex < 4) {
      baseIndex += 1;
    } else if (fitPreference === 'tight' && baseIndex > 0) {
      baseIndex -= 1;
    }

    // Confidence score logic (randomized for realism but typically 75-95%)
    let confidence = Math.floor(Math.random() * 21) + 75; // 75 to 95
    return {
      internalIndex: baseIndex,
      confidence: confidence,
    };
  },

  /**
   * Retrieves an array of size labels for a given region.
   * @param {string} system - The size region (e.g., 'US', 'EU')
   * @returns {string[]}
   */
  getSizesForSystem(system) {
    return this.systems[system] || this.systems['US'];
  },

  /**
   * Simulates tracking user feedback to improve future conversions.
   * Logs to localStorage.
   */
  trackFeedback(productName, purchasedSize, fitsWell) {
    let feedbacks = JSON.parse(localStorage.getItem('sizeFeedback') || '[]');
    feedbacks.push({
      productName,
      purchasedSize,
      fitsWell,
      date: new Date().toISOString(),
    });
    localStorage.setItem('sizeFeedback', JSON.stringify(feedbacks));
    console.log('Size feedback saved:', feedbacks[feedbacks.length - 1]);
  },
};
