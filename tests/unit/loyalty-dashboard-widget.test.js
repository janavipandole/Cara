import { describe, it, expect, beforeEach } from 'vitest';
import { calculateLoyaltyProgressPercent, LoyaltyDashboardWidget } from '../../js/loyalty-dashboard-widget.js';

describe('LoyaltyDashboardWidget', () => {
  let widget;

  beforeEach(() => {
    document.body.innerHTML = '<div id="loyalty-dashboard-container"></div>';
    widget = new LoyaltyDashboardWidget();
  });

  it('should calculate Bronze tier stats for initial purchases', () => {
    const data = widget.getOverviewData(100); // 100 points
    expect(data.tier).toBe('Bronze');
    expect(data.multiplier).toBe(1);
    expect(data.nextTier.name).toBe('Silver');
    expect(data.nextTier.pointsNeeded).toBe(400);
  });

  it('should calculate Silver tier stats for 1000 points purchase', () => {
    const data = widget.getOverviewData(1000); // 1000 points
    expect(data.tier).toBe('Silver');
    expect(data.multiplier).toBe(1.25);
    expect(data.nextTier.name).toBe('Gold');
    expect(data.nextTier.pointsNeeded).toBe(500);
  });

  it('should render widget HTML inside container', () => {
    const container = widget.renderWidget('loyalty-dashboard-container', 600);
    expect(container).not.toBeNull();
    expect(document.querySelector('.badge-tier')?.textContent).toBe('Silver');
    expect(document.querySelector('.multiplier-tag')?.textContent).toContain('1.25x');
  });

  it('should calculate loyalty tier progress percentage correctly', () => {
    expect(calculateLoyaltyProgressPercent(250, 500)).toBe(50);
    expect(calculateLoyaltyProgressPercent(500, 500)).toBe(100);
  });
});

describe('calculateLoyaltyProgressPercent', () => {
  it('is exported as a callable function', () => {
    expect(typeof calculateLoyaltyProgressPercent).toBe('function');
  });

  it('returns 100 for a zero or invalid target', () => {
    expect(calculateLoyaltyProgressPercent(50, 0)).toBe(100);
    expect(calculateLoyaltyProgressPercent(50, -10)).toBe(100);
    expect(calculateLoyaltyProgressPercent(50, null)).toBe(100);
  });

  it('clamps progress to 100 when points exceed the target', () => {
    expect(calculateLoyaltyProgressPercent(600, 500)).toBe(100);
  });

  it('clamps negative points to zero progress', () => {
    expect(calculateLoyaltyProgressPercent(-50, 500)).toBe(0);
  });
});
