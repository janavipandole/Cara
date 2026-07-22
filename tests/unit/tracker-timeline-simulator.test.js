import { describe, it, expect } from 'vitest';
import { TrackerTimelineSimulator } from '../../js/tracker-timeline-simulator.js';

describe('js/tracker-timeline-simulator.js TrackerTimelineSimulator tests', () => {
  const simulator = new TrackerTimelineSimulator();

  it('should return correct simulated status values', () => {
    expect(simulator.getSimulatedStatus(0)).toBe('Placed');
    expect(simulator.getSimulatedStatus(2)).toBe('Shipped');
    expect(simulator.getSimulatedStatus(9)).toBe('Delivered');
  });

  it('should return correct future timestamps relative to base', () => {
    const base = new Date('2026-07-18T12:00:00');
    const ts = simulator.getSimulatedTimestamp(2, base);
    const matchesEither = ts.includes('14:00:00') || ts.includes('2:00:00 PM') || ts.includes('2:00:00 pm') || ts.includes('14.00.00') || ts.includes('2.00.00');
    expect(matchesEither).toBe(true);
  });
});
