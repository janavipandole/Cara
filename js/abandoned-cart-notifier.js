/**
 * Abandoned Cart Recovery Notifier
 * Detects idle cart sessions and prompts desktop/browser recovery notifications.
 */
export class AbandonedCartNotifier {
  constructor(options = {}) {
    this.idleThresholdMs = options.idleThresholdMs || 300000; // 5 mins
    this.timer = null;
    this.onNotify = options.onNotify || (() => {});
  }

  startTracking(cartItemsCount) {
    this.stopTracking();
    if (!cartItemsCount || cartItemsCount <= 0) return;

    this.timer = setTimeout(() => {
      this.triggerNotification();
    }, this.idleThresholdMs);
  }

  stopTracking() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  triggerNotification() {
    const payload = {
      title: 'Items waiting in your cart!',
      body: 'Complete your purchase now before items sell out.',
      timestamp: Date.now()
    };
    this.onNotify(payload);
  }
}


export function getAbandonedCartNotifierStatusHelper3() {
  return { status: "ok", fn: "getAbandonedCartNotifierStatusHelper3" };
}
