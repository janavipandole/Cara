/**
 * User Activity Session Logger Engine
 * Logs user interaction events into categorized session logs and produces aggregate session summary analytics.
 */
export class UserActivityLogger {
  constructor(options = {}) {
    this.maxLogs = options.maxLogs || 100;
    this.storageKey = options.storageKey || 'cara_user_activity_logs';
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveLogs() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
      }
    } catch (e) {}
  }

  logEvent(eventName, eventData = {}, category = 'navigation') {
    if (!eventName) return null;

    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      eventName: String(eventName).trim(),
      category: String(category).trim().toLowerCase(),
      data: eventData,
      timestamp: Date.now()
    };

    this.logs.unshift(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.saveLogs();
    return entry;
  }

  getLogs(categoryFilter = null) {
    if (!categoryFilter || categoryFilter === 'all') {
      return [...this.logs];
    }
    const filterKey = String(categoryFilter).trim().toLowerCase();
    return this.logs.filter(log => log.category === filterKey);
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  getSessionSummary() {
    const totalEvents = this.logs.length;
    const categoryBreakdown = {};

    this.logs.forEach(log => {
      const cat = log.category || 'general';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    const lastEventTimestamp = totalEvents > 0 ? this.logs[0].timestamp : null;

    return {
      totalEvents,
      categoryBreakdown,
      lastEventTimestamp
    };
  }
}
