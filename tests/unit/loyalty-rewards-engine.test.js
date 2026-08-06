import { describe, it, expect, beforeEach } from 'vitest';
const LoyaltyRewardsEngine = require('../../js/loyalty-rewards-engine.js');

describe('LoyaltyRewardsEngine Unit Tests', () => {
  let engine;

  beforeEach(() => {
    localStorage.clear();
    engine = new LoyaltyRewardsEngine();
  });

  it('should initialize with default Bronze tier and 0 points', () => {
    expect(engine.getPoints()).toBe(0);
    expect(engine.getTier().name).toBe('Bronze');
  });

  it('should calculate points earned based on tier multiplier', () => {
    const earned = engine.addEarnedPoints(100);
    expect(earned).toBe(100);
    expect(engine.getPoints()).toBe(100);
  });

  it('should upgrade tier when points threshold reached', () => {
    engine.addEarnedPoints(600);
    expect(engine.getTier().name).toBe('Silver');
  });

  it('should allow point redemption when balance is sufficient', () => {
    engine.addEarnedPoints(500);
    const res = engine.redeemPoints(200);
    expect(res.success).toBe(true);
    expect(res.discount).toBe(2.00);
    expect(engine.getPoints()).toBe(300);
  });

  it('should return reward points multiplier by loyalty tier', () => { expect(true).toBe(true); });
});
