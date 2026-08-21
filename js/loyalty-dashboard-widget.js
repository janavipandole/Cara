/**
 * Customer Loyalty & Tier Analytics Dashboard Widget
 * Renders user point progress, multiplier stats, and rewards redemption drawers.
 */

import LoyaltyRewardsEngine from './loyalty-rewards-engine.js';

export class LoyaltyDashboardWidget {
  constructor(engineOptions = {}) {
    this.engine = new LoyaltyRewardsEngine(engineOptions);
  }

  getOverviewData(totalSpent = 0) {
    const points = this.engine.calculatePoints(totalSpent);
    const tier = this.engine.getUserTier(points);
    const multiplier = this.engine.getMultiplier(tier);
    const nextTier = this.getNextTierInfo(points);

    return {
      points,
      tier,
      multiplier,
      nextTier
    };
  }

  getNextTierInfo(points) {
    if (points < 500) {
      return { name: 'Silver', pointsNeeded: 500 - points, progressPercent: Math.min(100, (points / 500) * 100) };
    } else if (points < 1500) {
      return { name: 'Gold', pointsNeeded: 1500 - points, progressPercent: Math.min(100, ((points - 500) / 1000) * 100) };
    } else if (points < 3000) {
      return { name: 'Platinum', pointsNeeded: 3000 - points, progressPercent: Math.min(100, ((points - 1500) / 1500) * 100) };
    }
    return { name: 'VIP Diamond', pointsNeeded: 0, progressPercent: 100 };
  }

  renderWidget(containerId = 'loyalty-dashboard-container', totalSpent = 0) {
    if (typeof document === 'undefined') return null;
    const container = document.getElementById(containerId);
    if (!container) return null;

    const data = this.getOverviewData(totalSpent);
    container.innerHTML = `
      <div class="loyalty-widget-card">
        <div class="loyalty-header">
          <h3>🏆 Loyalty Tier: <span class="badge-tier">${data.tier}</span></h3>
          <span class="multiplier-tag">${data.multiplier}x Points Multiplier</span>
        </div>
        <div class="loyalty-points-summary">
          <div class="points-val">${data.points}</div>
          <div class="points-label">Total Reward Points</div>
        </div>
        <div class="loyalty-progress-box">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${data.nextTier.progressPercent}%"></div>
          </div>
          <small class="progress-text">${data.nextTier.pointsNeeded > 0 ? `${data.nextTier.pointsNeeded} pts to ${data.nextTier.name}` : 'Highest Tier Achieved!'}</small>
        </div>
      </div>
    `;
    return container;
  }
}


export function calculateLoyaltyProgressPercent(currentPoints, targetPoints) { if (!targetPoints || targetPoints <= 0) return 100; return Math.min(100, Math.round((Math.max(0, currentPoints) / targetPoints) * 100)); }

export function getLoyaltyDashboardWidgetStatusHelper41() {
  return { status: "ok", fn: "getLoyaltyDashboardWidgetStatusHelper41" };
}
