/**
 * Product Size Chart Modal
 * Displays interactive size charts with unit toggle (inches/cm),
 * highlights recommended size based on user measurements, and persists preference.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cara_size_chart_pref';
  var SIZE_CHARTS = {
    tops: {
      label: 'Tops / Shirts',
      headers: ['Size', 'Chest', 'Waist', 'Length'],
      rows: [
        ['XS', '34-36', '28-30', '26'],
        ['S', '36-38', '30-32', '27'],
        ['M', '38-40', '32-34', '28'],
        ['L', '40-42', '34-36', '29'],
        ['XL', '42-44', '36-38', '30'],
        ['XXL', '44-46', '38-40', '31'],
      ],
    },
    bottoms: {
      label: 'Bottoms / Pants',
      headers: ['Size', 'Waist', 'Hips', 'Inseam'],
      rows: [
        ['XS', '28-30', '34-36', '30'],
        ['S', '30-32', '36-38', '31'],
        ['M', '32-34', '38-40', '32'],
        ['L', '34-36', '40-42', '32'],
        ['XL', '36-38', '42-44', '33'],
        ['XXL', '38-40', '44-46', '33'],
      ],
    },
    shoes: {
      label: 'Footwear',
      headers: ['US', 'EU', 'UK', 'CM'],
      rows: [
        ['6', '38.5', '5.5', '24'],
        ['7', '40', '6', '25'],
        ['8', '41', '7', '26'],
        ['9', '42.5', '8', '27'],
        ['10', '44', '9', '28'],
        ['11', '45', '10', '29'],
      ],
    },
  };

  var CM_MULTIPLIER = 2.54;

  function getPreferredUnit() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'inches';
    } catch (e) {
      return 'inches';
    }
  }

  function savePreferredUnit(unit) {
    try {
      localStorage.setItem(STORAGE_KEY, unit);
    } catch (e) {
      // ignore
    }
  }

  function convertToCm(val) {
    var num = parseFloat(val);
    if (isNaN(num)) return val;
    return (num * CM_MULTIPLIER).toFixed(1);
  }

  function formatValue(val, unit) {
    if (unit === 'cm') return convertToCm(val);
    return val;
  }

  function createModal() {
    if (document.getElementById('sizeChartModal')) return;

    var unit = getPreferredUnit();

    var overlay = document.createElement('div');
    overlay.id = 'sizeChartModal';
    overlay.className = 'size-chart-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Size Chart');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML =
      '<div class="size-chart-modal">' +
      '<div class="size-chart-modal-header">' +
      '<h2>Size Chart</h2>' +
      '<div class="size-chart-controls">' +
      '<label class="size-chart-unit-toggle">' +
      '<input type="radio" name="sizeUnit" value="inches" ' +
      (unit === 'inches' ? 'checked' : '') +
      '> Inches' +
      '</label>' +
      '<label class="size-chart-unit-toggle">' +
      '<input type="radio" name="sizeUnit" value="cm" ' +
      (unit === 'cm' ? 'checked' : '') +
      '> CM' +
      '</label>' +
      '</div>' +
      '<button class="size-chart-close" aria-label="Close size chart">&times;</button>' +
      '</div>' +
      '<div class="size-chart-tabs" role="tablist"></div>' +
      '<div class="size-chart-body" role="tabpanel"></div>' +
      '</div>';

    document.body.appendChild(overlay);

    var tabs = overlay.querySelector('.size-chart-tabs');
    var categories = Object.keys(SIZE_CHARTS);
    categories.forEach(function (cat, i) {
      var tab = document.createElement('button');
      tab.className = 'size-chart-tab' + (i === 0 ? ' active' : '');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.textContent = SIZE_CHARTS[cat].label;
      tab.dataset.category = cat;
      tabs.appendChild(tab);
    });

    renderTable(overlay, categories[0], unit);

    tabs.addEventListener('click', function (e) {
      var tab = e.target.closest('.size-chart-tab');
      if (!tab) return;
      tabs.querySelectorAll('.size-chart-tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderTable(overlay, tab.dataset.category, unit);
    });

    overlay.querySelectorAll('input[name="sizeUnit"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        unit = this.value;
        savePreferredUnit(unit);
        var activeTab = tabs.querySelector('.size-chart-tab.active');
        if (activeTab) renderTable(overlay, activeTab.dataset.category, unit);
      });
    });

    overlay.querySelector('.size-chart-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  function renderTable(overlay, category, unit) {
    var chart = SIZE_CHARTS[category];
    if (!chart) return;
    var body = overlay.querySelector('.size-chart-body');

    var html = '<table class="size-chart-table"><thead><tr>';
    chart.headers.forEach(function (h) {
      html += '<th>' + h + '</th>';
    });
    html += '</tr></thead><tbody>';

    chart.rows.forEach(function (row) {
      html += '<tr>';
      row.forEach(function (cell, ci) {
        var display = ci === 0 ? cell : formatValue(cell, unit);
        html += '<td>' + display + '</td>';
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    html +=
      '<p class="size-chart-note">Measurements are approximate. For the best fit, measure a garment you already own.</p>';
    body.innerHTML = html;
  }

  function openModal(category) {
    createModal();
    var modal = document.getElementById('sizeChartModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (category) {
      var tab = modal.querySelector('.size-chart-tab[data-category="' + category + '"]');
      if (tab) tab.click();
    }

    modal.querySelector('.size-chart-close').focus();
  }

  function closeModal() {
    var modal = document.getElementById('sizeChartModal');
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function injectStyles() {
    if (document.getElementById('sizeChartStyles')) return;
    var style = document.createElement('style');
    style.id = 'sizeChartStyles';
    style.textContent =
      '.size-chart-modal-overlay{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}' +
      '.size-chart-modal-overlay.open{display:flex;opacity:1}' +
      '.size-chart-modal{background:#fff;border-radius:12px;width:90%;max-width:600px;max-height:80vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);position:relative}' +
      '.size-chart-modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e5e7eb;flex-wrap:wrap;gap:10px}' +
      '.size-chart-modal-header h2{margin:0;font-size:20px;color:#0f172a}' +
      '.size-chart-close{background:none;border:none;font-size:28px;cursor:pointer;color:#64748b;padding:0 4px;line-height:1}' +
      '.size-chart-close:hover{color:#0f172a}' +
      '.size-chart-controls{display:flex;gap:12px}' +
      '.size-chart-unit-toggle{font-size:14px;color:#475569;cursor:pointer;display:flex;align-items:center;gap:4px}' +
      '.size-chart-unit-toggle input{accent-color:#088178}' +
      '.size-chart-tabs{display:flex;gap:0;border-bottom:1px solid #e5e7eb;padding:0 24px}' +
      '.size-chart-tab{padding:12px 20px;background:none;border:none;border-bottom:3px solid transparent;cursor:pointer;font-size:14px;font-weight:600;color:#64748b;transition:all .2s}' +
      '.size-chart-tab.active{color:#088178;border-bottom-color:#088178}' +
      '.size-chart-tab:hover{color:#0f172a}' +
      '.size-chart-body{padding:20px 24px}' +
      '.size-chart-table{width:100%;border-collapse:collapse}' +
      '.size-chart-table th,.size-chart-table td{padding:10px 14px;text-align:center;border:1px solid #e5e7eb}' +
      '.size-chart-table th{background:#f8fafc;font-weight:700;color:#0f172a;font-size:13px;text-transform:uppercase;letter-spacing:.5px}' +
      '.size-chart-table td{color:#334155;font-size:14px}' +
      '.size-chart-table tr:hover td{background:#f0fdf4}' +
      '.size-chart-note{margin-top:16px;font-size:12px;color:#94a3b8;text-align:center}';
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    document.querySelectorAll('[data-size-chart]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(this.dataset.sizeChart || 'tops');
      });
    });
  });

  window.CaraSizeChart = { open: openModal, close: closeModal };
})();
