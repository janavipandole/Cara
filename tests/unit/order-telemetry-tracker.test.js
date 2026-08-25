import { describe, it, expect, beforeEach } from 'vitest';
import { OrderTelemetryTracker } from '../../js/order-telemetry-tracker.js';

describe('OrderTelemetryTracker Unit Tests', () => {
  let tracker;

  beforeEach(() => {
    tracker = new OrderTelemetryTracker();
  });

  it('should reject invalid or empty order IDs', () => {
    const res = tracker.trackOrder('');
    expect(res.success).toBe(false);
  });

  it('should return valid telemetry data for order query', () => {
    const res = tracker.trackOrder('ORD-998822');
    expect(res.success).toBe(true);
    expect(res.orderId).toBe('ORD-998822');
    expect(res.carrier).toBeDefined();
    expect(res.trackingCode).toBeDefined();
    expect(res.progressPercent).toBeGreaterThanOrEqual(25);
  });

  it('should return milestone definitions', () => {
    const milestones = tracker.getMilestones();
    expect(milestones.length).toBe(4);
    expect(milestones[3].key).toBe('DELIVERED');
  });

  it('should calculate checkout telemetry duration in milliseconds', () => {
    const start = Date.now() - 5000;
    const duration = tracker.getCheckoutDurationMs(start);
    expect(duration).toBeGreaterThanOrEqual(5000);
  });

  it('should return 0 duration for invalid start times', () => {
    expect(tracker.getCheckoutDurationMs(null)).toBe(0);
    expect(tracker.getCheckoutDurationMs('not-a-number')).toBe(0);
    expect(tracker.getCheckoutDurationMs(undefined)).toBe(0);
  });

  it('should reject non-string order identifiers', () => {
    expect(tracker.trackOrder(12345).success).toBe(false);
    expect(tracker.trackOrder(null).success).toBe(false);
  });

  it('should uppercase and trim the order identifier', () => {
    const res = tracker.trackOrder('  ord-abc123  ');
    expect(res.orderId).toBe('ORD-ABC123');
  });

  it('should return progress percents within the milestone range', () => {
    for (const orderId of ['AAA111', 'BBB222', 'CCC333', 'DDD444']) {
      const res = tracker.trackOrder(orderId);
      expect(res.progressPercent).toBeGreaterThanOrEqual(25);
      expect(res.progressPercent).toBeLessThanOrEqual(100);
      expect(res.statusLabel).toBeDefined();
    }
  });
});
