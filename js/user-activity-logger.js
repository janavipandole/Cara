/**
 * User Activity Session Logger
 * Logs key navigation and user action events locally for analytics telemetry.
 */
export class UserActivityLogger {
  constructor(storageKey = 'cara_activity_logs') {
    this.storageKey = storageKey;
    this.maxEntries = 50;
  }

  logEvent(eventName, payload = {}) {
    const logs = this.getLogs();
    const entry = {
      event: eventName,
      payload,
      timestamp: new Date().toISOString()
    };
    logs.push(entry);

    if (logs.length > this.maxEntries) {
      logs.shift();
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (err) {
      console.warn('Unable to persist activity logs:', err);
    }
  }

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch {
      return [];
    }
  }

  clearLogs() {
    localStorage.removeItem(this.storageKey);
  }
}
