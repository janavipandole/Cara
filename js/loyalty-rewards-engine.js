/**
 * Loyalty Rewards Engine
 * Customer rewards tiering, points accrual, Diamond VIP tier, multiplier lookup, and progress analytics.
 */
export class LoyaltyRewardsEngine {
  constructor(options = {}) {
    this.pointsPerDollar = options.pointsPerDollar || 1;
    this.tiers = [
      { name: 'Bronze', minPoints: 0, multiplier: 1.0 },
      { name: 'Silver', minPoints: 500, multiplier: 1.25 },
      { name: 'Gold', minPoints: 1500, multiplier: 1.5 },
      { name: 'Platinum', minPoints: 3000, multiplier: 2.0 },
      { name: 'Diamond', minPoints: 5000, multiplier: 2.5 }
    ];
  }

  calculatePointsEarned(purchaseAmount, currentTier = 'Bronze') {
    const amount = Math.max(0, purchaseAmount || 0);
    const tierObj = this.getTierDetails(currentTier);
    const multiplier = tierObj ? tierObj.multiplier : 1.0;
    return Math.floor(amount * this.pointsPerDollar * multiplier);
  }

  getTierDetails(tierName) {
    if (!tierName) return this.tiers[0];
    const nameLower = String(tierName).trim().toLowerCase();
    return this.tiers.find(t => t.name.toLowerCase() === nameLower) || this.tiers[0];
  }

  determineTierForPoints(points) {
    const pts = Math.max(0, points || 0);
    let currentTier = this.tiers[0];
    for (const tier of this.tiers) {
      if (pts >= tier.minPoints) {
        currentTier = tier;
      } else {
        break;
      }
    }
    return currentTier;
  }

  getNextTierProgress(currentPoints) {
    const pts = Math.max(0, currentPoints || 0);
    const currentTier = this.determineTierForPoints(pts);
    const currentIndex = this.tiers.findIndex(t => t.name === currentTier.name);

    if (currentIndex >= this.tiers.length - 1) {
      return {
        currentTier: currentTier.name,
        nextTier: null,
        pointsNeeded: 0,
        progressPct: 100
      };
    }

    const nextTier = this.tiers[currentIndex + 1];
    const pointsNeeded = nextTier.minPoints - pts;
    const range = nextTier.minPoints - currentTier.minPoints;
    const progress = pts - currentTier.minPoints;
    const progressPct = Math.min(100, Math.round((progress / range) * 100));

    return {
      currentTier: currentTier.name,
      nextTier: nextTier.name,
      pointsNeeded,
      progressPct
    };
  }

  getRewardsMultiplierForTier(tierName) {
    return this.getTierDetails(tierName).multiplier;
  }
}