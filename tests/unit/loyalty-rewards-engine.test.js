import { describe, it, expect } from 'vitest';
import { LoyaltyRewardsEngine } from '../../js/loyalty-rewards-engine.js';

describe('LoyaltyRewardsEngine', () => {
  it('calculates earned points with tier multiplier', () => {
    const engine = new LoyaltyRewardsEngine();
    expect(engine.calculatePointsEarned(100, 'Bronze')).toBe(100);
    expect(engine.calculatePointsEarned(100, 'Gold')).toBe(150);
    expect(engine.calculatePointsEarned(100, 'Diamond')).toBe(250);
  });

  it('determines tier from total accumulated points including Diamond', () => {
    const engine = new LoyaltyRewardsEngine();
    expect(engine.determineTierForPoints(400).name).toBe('Bronze');
    expect(engine.determineTierForPoints(600).name).toBe('Silver');
    expect(engine.determineTierForPoints(1600).name).toBe('Gold');
    expect(engine.determineTierForPoints(3500).name).toBe('Platinum');
    expect(engine.determineTierForPoints(5500).name).toBe('Diamond');
  });

  it('computes next tier progress metrics accurately', () => {
    const engine = new LoyaltyRewardsEngine();
    const progress = engine.getNextTierProgress(1000); // Between Silver (500) and Gold (1500)
    expect(progress.currentTier).toBe('Silver');
    expect(progress.nextTier).toBe('Gold');
    expect(progress.pointsNeeded).toBe(500);
    expect(progress.progressPct).toBe(50);
  });

  it('returns 100% progress for max Diamond tier', () => {
    const engine = new LoyaltyRewardsEngine();
    const progress = engine.getNextTierProgress(6000);
    expect(progress.currentTier).toBe('Diamond');
    expect(progress.nextTier).toBeNull();
    expect(progress.progressPct).toBe(100);
  });
});
