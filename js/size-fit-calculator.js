/**
 * Size & Fit Calculator Engine
 * Calculates optimal apparel sizes based on user height, weight, and fit preference.
 */
export class SizeFitCalculator {
  constructor() {
    this.sizeChart = [
      { maxBust: 84, maxWaist: 66, size: 'XS' },
      { maxBust: 90, maxWaist: 72, size: 'S' },
      { maxBust: 96, maxWaist: 78, size: 'M' },
      { maxBust: 104, maxWaist: 86, size: 'L' },
      { maxBust: 112, maxWaist: 94, size: 'XL' },
      { maxBust: 120, maxWaist: 102, size: 'XXL' }
    ];
  }

  recommendSize(chestCm, waistCm, fitPreference = 'regular') {
    if (!chestCm || chestCm <= 0) return 'M';
    
    let matchedSize = 'XXL';
    for (const entry of this.sizeChart) {
      if (chestCm <= entry.maxBust && (!waistCm || waistCm <= entry.maxWaist)) {
        matchedSize = entry.size;
        break;
      }
    }

    if (fitPreference === 'slim' && matchedSize !== 'XS') {
      matchedSize = this.getAdjacentSize(matchedSize, -1);
    } else if (fitPreference === 'loose' && matchedSize !== 'XXL') {
      matchedSize = this.getAdjacentSize(matchedSize, 1);
    }

    return matchedSize;
  }

  getAdjacentSize(size, offset) {
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const idx = order.indexOf(size);
    if (idx === -1) return size;
    const newIdx = Math.max(0, Math.min(order.length - 1, idx + offset));
    return order[newIdx];
  }
}

window.getSizeFitCalculatorStatusHelper115 = function() {
  return {
    status: 'active',
    module: 'SizeFitCalculator',
    helper: 'getSizeFitCalculatorStatusHelper115'
  };
};
