/**
 * User Loyalty Rewards Tier Engine
 * Calculates customer loyalty points, tier statuses (Bronze, Silver, Gold, Platinum), and point redemption logic.
 */

class LoyaltyRewardsEngine {
  constructor(storageKey = 'cara_loyalty_data_v2') {
    this.storageKey = storageKey;
    this.tiers = [
      { name: 'Bronze', minPoints: 0, multiplier: 1 },
      { name: 'Silver', minPoints: 500, multiplier: 1.25 },
      { name: 'Gold', minPoints: 1500, multiplier: 1.5 },
      { name: 'Platinum', minPoints: 3000, multiplier: 2.0 }
    ];
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : { points: 0, history: [] };
    } catch (e) {
      return { points: 0, history: [] };
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save loyalty state:', e);
    }
  }

  getPoints() {
    return this.data.points || 0;
  }

  getTier(points = this.getPoints()) {
    let currentTier = this.tiers[0];
    for (const tier of this.tiers) {
      if (points >= tier.minPoints) {
        currentTier = tier;
      }
    }
    return currentTier;
  }

  addEarnedPoints(purchaseAmount) {
    if (purchaseAmount <= 0) return 0;
    const currentTier = this.getTier();
    const basePoints = Math.floor(purchaseAmount);
    const earned = Math.floor(basePoints * currentTier.multiplier);
    
    this.data.points += earned;
    this.data.history.push({
      type: 'EARN',
      amount: purchaseAmount,
      points: earned,
      date: new Date().toISOString()
    });

    this.saveData();
    return earned;
  }

  redeemPoints(pointsToRedeem) {
    const amount = Number(pointsToRedeem);
    if (!Number.isFinite(amount) || amount <= 0 || amount > this.data.points) {
      return { success: false, reason: 'Insufficient points balance' };
    }
    
    const discountValue = parseFloat((amount / 100).toFixed(2));
    this.data.points -= amount;
    this.data.history.push({
      type: 'REDEEM',
      points: amount,
      discount: discountValue,
      date: new Date().toISOString()
    });

    this.saveData();
    return { success: true, discount: discountValue, remainingPoints: this.data.points };
  }
  calculatePoints(spent = 0) {
    return Math.floor(spent);
  }

  getUserTier(points = 0) {
    return this.getTier(points).name;
  }

  getMultiplier(tierName = 'Bronze') {
    const found = this.tiers.find(t => t.name === tierName);
    return found ? found.multiplier : 1.0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoyaltyRewardsEngine;
  module.exports.getRewardsMultiplierForTier = getRewardsMultiplierForTier;
} else {
  window.LoyaltyRewardsEngine = LoyaltyRewardsEngine;
}



function getRewardsMultiplierForTier(tier = 'bronze') { const multipliers = { bronze: 1.0, silver: 1.25, gold: 1.5, platinum: 2.0 }; return multipliers[tier.toLowerCase()] || 1.0; }