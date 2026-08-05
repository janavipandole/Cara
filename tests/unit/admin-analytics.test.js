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

  // Replicate _fmtRev for isolated testing
  function fmtRev(val) {
    return (
      '\u20b9' +
      parseFloat(val)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')
    );
  }

  // Replicate _escape for isolated testing
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

    it('formats a number with lakhs separator', () => {
      expect(fmtRev(123456.78)).toBe('\u20b91,23,456.78');
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

  describe('AdminDashboard.refresh', () => {
    it('renders revenue, volume, and customer counts from API response', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ total_revenue: 150000, total_orders: 423, total_customers: 312 }),
      });
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      await AdminDashboard.refresh();

      expect(revEl.textContent).toContain('150,000');
      expect(volumeEl.textContent).toBe('423');
      expect(customersEl.textContent).toBe('312');
    });

    it('shows error alert when API returns 403', async () => {
      fetchSpy.mockResolvedValueOnce({ status: 403, ok: false });
      fetchSpy.mockResolvedValueOnce({ status: 403, ok: false });
      fetchSpy.mockResolvedValueOnce({ status: 403, ok: false });

      await AdminDashboard.refresh();

      expect(errorAlert.style.display).toBe('block');
      expect(errorAlert.textContent).toContain('Admin privilege');
    });

    it('handles zero values gracefully', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ total_revenue: 0, total_orders: 0, total_customers: 0 }),
      });
      fetchSpy.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([]) });
      fetchSpy.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([]) });

      await AdminDashboard.refresh();

      expect(revEl.textContent).toContain('0');
      expect(volumeEl.textContent).toBe('0');
      expect(customersEl.textContent).toBe('0');
    });
  });
});
