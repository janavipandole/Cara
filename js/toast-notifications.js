/**
 * Toast Notification Dispatch Module
 * Provides a centralized notification API wrapping CaraToast.
 */

export class CaraNotificationCenter {
  /**
   * Dispatch a notification with the given type and message.
   * @param {string} message - The notification message.
   * @param {string} type - Notification type: 'info' | 'success' | 'error' | 'warning'.
   * @param {number} [duration] - Display duration in milliseconds (default 4000).
   */
  static dispatch(message, type = 'info', duration = 4000) {
    if (typeof CaraToast !== 'undefined') {
      CaraToast.show(message, type, duration);
    }
  }

  /**
   * Show a success notification.
   * @param {string} message
   * @param {number} [duration]
   */
  static showSuccess(message, duration) {
    CaraNotificationCenter.dispatch(message, 'success', duration);
  }

  /**
   * Show an error notification.
   * @param {string} message
   * @param {number} [duration]
   */
  static showError(message, duration) {
    CaraNotificationCenter.dispatch(message, 'error', duration);
  }

  /**
   * Show a warning notification.
   * @param {string} message
   * @param {number} [duration]
   */
  static showWarning(message, duration) {
    CaraNotificationCenter.dispatch(message, 'warning', duration);
  }

  /**
   * Show an info notification.
   * @param {string} message
   * @param {number} [duration]
   */
  static showInfo(message, duration) {
    CaraNotificationCenter.dispatch(message, 'info', duration);
  }
}

if (typeof window !== 'undefined') {
  window.CaraNotificationCenter = CaraNotificationCenter;
}
