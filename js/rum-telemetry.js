/**
 * Real User Monitoring (RUM) Telemetry & Core Web Vitals Performance Collector
 * 
 * Measures real-user Core Web Vitals (LCP, FID/INP, CLS, TTFB) using PerformanceObserver
 * and transmits metrics non-blocking via navigator.sendBeacon.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RUMTelemetry = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class RUMTelemetryCollector {
    constructor(options = {}) {
      this.endpoint = options.endpoint || '/api/telemetry/rum';
      this.metrics = {
        url: typeof window !== 'undefined' ? window.location.pathname : '/',
        lcp: null,
        cls: 0,
        fid: null,
        ttfb: null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      };

      this.initObservers();
      this.bindBeaconFlush();
    }

    initObservers() {
      if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

      // 1. TTFB calculation from navigation timing
      try {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries && navEntries.length > 0) {
          this.metrics.ttfb = Math.round(navEntries[0].responseStart - navEntries[0].requestStart);
        }
      } catch (e) {
        // ignore nav timing error
      }

      // 2. Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.metrics.lcp = Math.round(lastEntry.startTime);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // LCP unsupported
      }

      // 3. Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              this.metrics.cls += entry.value;
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        // CLS unsupported
      }

      // 4. First Input Delay (FID) / Long Tasks
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const firstInput = entryList.getEntries()[0];
          if (firstInput) {
            this.metrics.fid = Math.round(firstInput.processingStart - firstInput.startTime);
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        // FID unsupported
      }
    }

    bindBeaconFlush() {
      if (typeof window === 'undefined') return;

      const flush = () => {
        const payload = JSON.stringify(this.metrics);
        const apiBaseUrl = window.CARA_API_BASE_URL || '';
        const targetUrl = `${apiBaseUrl}${this.endpoint}`;

        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(targetUrl, blob);
        } else if (window.fetch) {
          fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch((err) => { console.warn('[RUM] Beacon fallback failed:', err); });
        }
      };

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          flush();
        }
      });
      window.addEventListener('pagehide', flush);
    }
  }

  // Auto-instantiate on page load if browser context
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      if (!window.__rum_telemetry_instance) {
        window.__rum_telemetry_instance = new RUMTelemetryCollector();
      }
    });
  }

  return {
    RUMTelemetryCollector,
  };
});

window.getRumTelemetryStatusHelper114 = function() {
  return {
    status: 'active',
    module: 'RUMTelemetry',
    hasInstance: typeof window.__rum_telemetry_instance !== 'undefined',
    helper: 'getRumTelemetryStatusHelper114'
  };
};
