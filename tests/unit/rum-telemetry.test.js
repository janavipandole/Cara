import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('RUMTelemetryCollector Unit Tests', () => {
  let RUMTelemetryCollector;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../../js/rum-telemetry.js');
    const exports = module.default || window.RUMTelemetry;
    RUMTelemetryCollector = exports.RUMTelemetryCollector;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes metrics collection with URL and UserAgent', () => {
    const collector = new RUMTelemetryCollector();
    expect(collector.metrics.url).toBe(window.location.pathname);
    expect(collector.metrics.user_agent).toBe(navigator.userAgent);
  });

  it('transmits metrics non-blocking via navigator.sendBeacon on visibilitychange', () => {
    navigator.sendBeacon = vi.fn().mockReturnValue(true);

    const collector = new RUMTelemetryCollector();
    collector.metrics.lcp = 1200;
    collector.metrics.cls = 0.02;

    window.dispatchEvent(new Event('pagehide'));

    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    const args = navigator.sendBeacon.mock.calls[0];
    expect(args[0]).toContain('/api/telemetry/rum');
  });

  it('falls back to fetch if sendBeacon is unavailable', () => {
    delete navigator.sendBeacon;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

    const collector = new RUMTelemetryCollector();
    collector.metrics.lcp = 800;

    window.dispatchEvent(new Event('pagehide'));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toContain('/api/telemetry/rum');
  });
});
