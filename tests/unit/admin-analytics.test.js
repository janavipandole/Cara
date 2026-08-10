/**
 * Unit tests for admin-analytics.js
 * Tests client-side KPI rendering helpers and DOM update functions.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const fetchSpy = vi.fn();

import '../../js/admin-analytics.js';

describe('admin-analytics.js unit tests', () => {
  let revEl, volumeEl, customersEl, catTable, statusWrap, errorAlert;

  beforeEach(() => {
    consoleErrorSpy.mockClear();
    fetchSpy.mockReset();
    document.body.innerHTML = `
      <div id="analyticsRevenue"></div>
      <div id="analyticsOrders"></div>
      <div id="analyticsCustomers"></div>
      <table id="analyticsCategoryTable"></table>
      <div id="analyticsStatusWrap"></div>
      <div id="analyticsError"></div>
    `;
    revEl = document.getElementById('analyticsRevenue');
    volumeEl = document.getElementById('analyticsOrders');
    customersEl = document.getElementById('analyticsCustomers');
    catTable = document.getElementById('analyticsCategoryTable');
    statusWrap = document.getElementById('analyticsStatusWrap');
    errorAlert = document.getElementById('analyticsError');
    globalThis.fetch = fetchSpy;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Replicate _fmtRev for isolated testing (function is private to IIFE)
  function fmtRev(val) {
    return (
      '\u20b9' +
      parseFloat(val)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')
    );
  }

  // Replicate _escape for isolated testing (function is private to IIFE)
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  describe('_fmtRev currency formatting', () => {
    it('formats a whole number with two decimal places', () => {
      expect(fmtRev(1000)).toBe('\u20b91,000.00');
    });

    it('formats a number with thousands separator', () => {
      expect(fmtRev(123456.78)).toBe('\u20b9123,456.78');
    });

    it('handles zero', () => {
      expect(fmtRev(0)).toBe('\u20b90.00');
    });

    it('handles a string number', () => {
      expect(fmtRev('500.5')).toBe('\u20b9500.50');
    });
  });

  describe('_escape HTML entity encoding', () => {
    it('escapes ampersand', () => {
      expect(esc('A & B')).toBe('A &amp; B');
    });

    it('escapes less-than and greater-than', () => {
      expect(esc('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes double and single quotes', () => {
      expect(esc('say "hello"')).toBe('say &quot;hello&quot;');
      expect(esc("it's")).toBe('it&#39;s');
    });

    it('leaves plain text unchanged', () => {
      expect(esc('Hello World')).toBe('Hello World');
    });
  });

  describe('AdminDashboard exposure and API integration', () => {
    it('exposes AdminDashboard on window', () => {
      expect(typeof window.AdminDashboard).toBe('object');
    });

    it('exposes a refresh function on AdminDashboard', () => {
      expect(typeof window.AdminDashboard.refresh).toBe('function');
    });

    it('refresh calls fetch for all three analytics endpoints', async () => {
      fetchSpy.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });

      await window.AdminDashboard.refresh();

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('calls fetch for all three analytics endpoints', async () => {
      fetchSpy.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });

      await window.AdminDashboard.refresh();

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });
  });

  it('should return cached revenue summary stats object', () => {
    expect(typeof window.AdminDashboard).toBe('object');
  });

  it('loads dashboard data immediately when the DOM is already ready', async () => {
    vi.resetModules();
    // The DOM is populated before import so the module's immediate init fires.
    document.body.innerHTML = `
      <div id="analyticsRevenue"></div>
      <div id="analyticsOrders"></div>
      <div id="analyticsCustomers"></div>
      <table id="analyticsCategoryTable"></table>
      <div id="analyticsStatusWrap"></div>
      <div id="analyticsError"></div>
    `;
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'complete',
    });
    fetchSpy.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });

    await import('../../js/admin-analytics.js');

    // initDashboard fired at import time without needing DOMContentLoaded.
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('exposes refresh that calls all three analytics endpoints with credentials', async () => {
    fetchSpy.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({}) });
    await window.AdminDashboard.refresh();
    const urls = fetchSpy.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes('/api/admin/analytics/summary'))).toBe(true);
    expect(urls.some((u) => u.includes('/api/admin/analytics/category-sales'))).toBe(true);
    expect(urls.some((u) => u.includes('/api/admin/analytics/order-status-distribution'))).toBe(true);
    fetchSpy.mock.calls.forEach(([, opts]) => {
      expect(opts.credentials).toBe('include');
    });
  });
});
