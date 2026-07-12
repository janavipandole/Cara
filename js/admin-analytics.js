/**
 * admin-analytics.js
 * Client-side script for the store manager dashboard.
 *
 * Fetches shop KPI analytics (lifetime revenue, order volumes, category splits)
 * from /api/admin/analytics/* and dynamically renders progress bars, metrics,
 * and data tables.
 */

(function () {
  'use strict';

  const SUMMARY_API = '/api/admin/analytics/summary';
  const CATEGORY_API = '/api/admin/analytics/category-sales';
  const STATUS_API = '/api/admin/analytics/order-status-distribution';

  // ── DOM References ─────────────────────────────────────────────────────────
  const revEl = document.getElementById('analyticsRevenue');
  const volumeEl = document.getElementById('analyticsOrders');
  const customersEl = document.getElementById('analyticsCustomers');
  const catTable = document.getElementById('analyticsCategoryTable');
  const statusWrap = document.getElementById('analyticsStatusWrap');
  const errorAlert = document.getElementById('analyticsError');

  // ── Format helpers ─────────────────────────────────────────────────────────
  function _fmtRev(val) {
    return (
      '₹' +
      parseFloat(val)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,')
    );
  }

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Render functions ───────────────────────────────────────────────────────
  function renderSummary(data) {
    if (revEl) revEl.textContent = _fmtRev(data.total_revenue || 0);
    if (volumeEl)
      volumeEl.textContent = (data.total_orders || 0).toLocaleString();
    if (customersEl)
      customersEl.textContent = (data.total_customers || 0).toLocaleString();
  }

  function renderCategorySales(list) {
    if (!catTable) return;
    if (list.length === 0) {
      catTable.innerHTML =
        '<tr><td colspan="3" class="text-muted text-center">No sales recorded yet.</td></tr>';
      return;
    }
    catTable.innerHTML = list
      .map(
        (r) => `
      <tr>
        <td><strong>${_escape(r.category.toUpperCase())}</strong></td>
        <td class="text-right">${r.units_sold.toLocaleString()} units</td>
        <td class="text-right font-weight-bold text-teal">${_fmtRev(r.revenue)}</td>
      </tr>`,
      )
      .join('');
  }

  function renderStatusDistribution(list) {
    if (!statusWrap) return;
    if (list.length === 0) {
      statusWrap.innerHTML =
        '<p class="text-muted text-center">No orders to categorize.</p>';
      return;
    }
    const maxVal = Math.max(...list.map((r) => r.count), 1);

    statusWrap.innerHTML = list
      .map((r) => {
        const pct = Math.round((r.count / maxVal) * 100);
        return `
        <div class="status-dist-bar-wrap" role="group" aria-label="${r.status}: ${r.count} orders">
          <div class="status-dist-header">
            <span class="status-label">${_escape(r.status)}</span>
            <span class="status-count">${r.count.toLocaleString()}</span>
          </div>
          <div class="status-progress-track" role="progressbar" aria-valuenow="${r.count}" aria-valuemin="0" aria-valuemax="${maxVal}">
            <div class="status-progress-fill" style="width: ${pct}%"></div>
          </div>
        </div>`;
      })
      .join('');
  }

  // ── Load all data ──────────────────────────────────────────────────────────
  async function loadDashboard() {
    try {
      const [sumRes, catRes, statRes] = await Promise.all([
        fetch(SUMMARY_API, { credentials: 'include' }),
        fetch(CATEGORY_API, { credentials: 'include' }),
        fetch(STATUS_API, { credentials: 'include' }),
      ]);

      if (sumRes.status === 403 || catRes.status === 403) {
        throw new Error('Admin privilege required.');
      }
      if (!sumRes.ok || !catRes.ok || !statRes.ok) {
        throw new Error('Failed to retrieve dashboard analytics.');
      }

      const sumData = await sumRes.json();
      const catData = await catRes.json();
      const statData = await statRes.json();

      renderSummary(sumData);
      renderCategorySales(catData);
      renderStatusDistribution(statData);

      if (errorAlert) errorAlert.style.display = 'none';
    } catch (err) {
      console.error('[AdminAnalytics] Load failed:', err);
      if (errorAlert) {
        errorAlert.textContent = err.message || 'Error loading dashboard.';
        errorAlert.style.display = 'block';
        errorAlert.setAttribute('role', 'alert');
      }
    }
  }

  // ── Initialise ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Only load if dashboard components exist on page
    if (revEl || catTable || statusWrap) {
      loadDashboard();
    }
  });

  window.AdminDashboard = { refresh: loadDashboard };
})();
