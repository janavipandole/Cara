/**
 * Order Tracker Timeline Simulator Utility
 * Simulates status changes and timestamps for order tracking.
 */
class TrackerTimelineSimulator {
  constructor() {
    this.stages = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
  }

  getSimulatedStatus(index) {
    if (index < 0) return this.stages[0];
    if (index >= this.stages.length) return this.stages[this.stages.length - 1];
    return this.stages[index];
  }

  getSimulatedTimestamp(index, baseTime) {
    const base = baseTime || new Date();
    const resultDate = new Date(base.getTime());
    // Add 1 hour per status step
    resultDate.setHours(base.getHours() + index);
    return resultDate.toLocaleString();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TrackerTimelineSimulator };
} else if (typeof window !== 'undefined') {
  window.TrackerTimelineSimulator = TrackerTimelineSimulator;
}
