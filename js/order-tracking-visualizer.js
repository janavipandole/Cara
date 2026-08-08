/**
 * Order Tracking Visualizer Engine
 * Renders interactive status timeline nodes, active milestone progress, and arrival predictions.
 */

export class OrderTrackingVisualizer {
  constructor() {
    this.stages = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  }

  getStageIndex(statusString = '') {
    const norm = statusString.trim().toLowerCase();
    if (norm.includes('place')) return 0;
    if (norm.includes('process')) return 1;
    if (norm.includes('ship')) return 2;
    if (norm.includes('out') || norm.includes('delivery')) return 3;
    if (norm.includes('deliver')) return 4;
    return -1;
  }

  calculateProgressPercent(statusString = '') {
    const index = this.getStageIndex(statusString);
    if (index < 0) return 0;
    return Math.round((index / (this.stages.length - 1)) * 100);
  }

  renderTimeline(containerId, currentStatus = 'Shipped') {
    if (typeof document === 'undefined') return null;
    const container = document.getElementById(containerId);
    if (!container) return null;

    const activeIndex = this.getStageIndex(currentStatus);
    const progress = this.calculateProgressPercent(currentStatus);

    const nodesHtml = this.stages.map((stage, idx) => {
      const isCompleted = idx <= activeIndex;
      const isCurrent = idx === activeIndex;
      return `
        <div class="timeline-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}" role="listitem" ${isCurrent ? 'aria-current="step"' : ''}>
          <div class="node-icon">${isCompleted ? '✓' : idx + 1}</div>
          <span class="node-label">${stage}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="tracking-timeline-wrapper">
        <div class="timeline-bar-bg">
          <div class="timeline-bar-fill" style="width: ${progress}%"></div>
        </div>
        <div class="timeline-nodes" role="list">
          ${nodesHtml}
        </div>
      </div>
    `;
    return container;
  }
}


export function getTrackingStepStatusClass(currentStep, targetStep) { if (currentStep > targetStep) return 'completed'; if (currentStep === targetStep) return 'active'; return 'pending'; }