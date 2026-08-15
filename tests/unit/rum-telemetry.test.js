import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Import the module once at file level
import * as rumModule from '../../js/rum-telemetry.js';

const { RUMTelemetryCollector } = rumModule.default || rumModule;

describe('RUMTelemetryCollector Unit Tests', () => {
  let collector;

  beforeAll(() => {
    vi.useFakeTimers();
    collector = new RUMTelemetryCollector();
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset navigator.sendBeacon
    if ('sendBeacon' in navigator) {
      try { delete navigator.sendBeacon; } catch {}
    }
    if ('fetch' in globalThis) {
      try { delete globalThis.fetch; } catch {}
    }
  });

  it('initializes metrics collection with URL and UserAgent', () => {
    expect(collector.metrics.url).toBe(window.location.pathname);
    expect(collector.metrics.user_agent).toBe(navigator.userAgent);
  });

  it('transmits metrics non-blocking via navigator.sendBeacon on visibilitychange', () => {
    navigator.sendBeacon = vi.fn().mockReturnValue(true);
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
    collector.metrics.lcp = 800;

    window.dispatchEvent(new Event('pagehide'));

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch.mock.calls[0][0]).toContain('/api/telemetry/rum');
  });
});
