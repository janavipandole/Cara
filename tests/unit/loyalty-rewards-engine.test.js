import { describe, it, expect, beforeEach } from 'vitest';
import { getRewardsMultiplierForTier } from '../../js/loyalty-rewards-engine.js';
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

  it('should return reward points multiplier by loyalty tier', () => {
    expect(getRewardsMultiplierForTier('bronze')).toBe(1.0);
    expect(getRewardsMultiplierForTier('silver')).toBe(1.25);
    expect(getRewardsMultiplierForTier('gold')).toBe(1.5);
    expect(getRewardsMultiplierForTier('platinum')).toBe(2.0);
  });

  it('should reject non-finite redemption amounts without corrupting the balance', () => {
    engine.addEarnedPoints(500);
    const res = engine.redeemPoints(NaN);
    expect(res.success).toBe(false);
    expect(engine.getPoints()).toBe(500);

    const resUndef = engine.redeemPoints(undefined);
    expect(resUndef.success).toBe(false);
    expect(engine.getPoints()).toBe(500);
  });

  it('should reject redeeming more points than the balance', () => {
    engine.addEarnedPoints(100);
    const res = engine.redeemPoints(101);
    expect(res.success).toBe(false);
    expect(engine.getPoints()).toBe(100);
  });

  it('should assign tiers exactly at the point boundaries', () => {
    engine.data.points = 499;
    expect(engine.getTier().name).toBe('Bronze');
    engine.data.points = 500;
    expect(engine.getTier().name).toBe('Silver');
    engine.data.points = 1500;
    expect(engine.getTier().name).toBe('Gold');
    engine.data.points = 3000;
    expect(engine.getTier().name).toBe('Platinum');
  });

  it('should return the multiplier for a tier name via getMultiplier', () => {
    expect(engine.getMultiplier('Bronze')).toBe(1.0);
    expect(engine.getMultiplier('Silver')).toBe(1.25);
    expect(engine.getMultiplier('Gold')).toBe(1.5);
    expect(engine.getMultiplier('Platinum')).toBe(2.0);
  });

  it('should return 1.0 for an unknown tier name in getMultiplier', () => {
    expect(engine.getMultiplier('Diamond')).toBe(1.0);
    expect(engine.getMultiplier('')).toBe(1.0);
  });

  it('should reject redemption of more points than the balance', () => {
    engine.addEarnedPoints(100);
    const res = engine.redeemPoints(150);
    expect(res.success).toBe(false);
    expect(engine.getPoints()).toBe(100);
  });
});

describe('getRewardsMultiplierForTier', () => {
  it('is exported as a callable function', () => {
    expect(typeof getRewardsMultiplierForTier).toBe('function');
  });

  it('defaults to bronze for an unknown or empty tier', () => {
    expect(getRewardsMultiplierForTier('diamond')).toBe(1.0);
    expect(getRewardsMultiplierForTier('')).toBe(1.0);
    expect(getRewardsMultiplierForTier()).toBe(1.0);
  });

  it('matches tier names case-insensitively', () => {
    expect(getRewardsMultiplierForTier('GOLD')).toBe(1.5);
    expect(getRewardsMultiplierForTier('Silver')).toBe(1.25);
  });
});
