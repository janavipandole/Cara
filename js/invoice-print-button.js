/**
 * Print Order Invoice Button
 * Generates a printable invoice from order data and opens the browser print dialog.
 */
(function () {
  'use strict';

  function generateInvoice(order) {
    if (!order) return;

    var itemsHtml = '';
    (order.items || []).forEach(function (item) {
      itemsHtml +=
        '<tr>' +
        '<td style="padding:10px;border-bottom:1px solid #e5e7eb">' + (item.name || 'Item') + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">' + (item.qty || 1) + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">' + (item.price || '$0.00') + '</td>' +
        '<td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">$' + ((parseFloat(item.price) || 0) * (item.qty || 1)).toFixed(2) + '</td>' +
        '</tr>';
    });

    var total = (order.items || []).reduce(function (sum, item) {
      return sum + (parseFloat(item.price) || 0) * (item.qty || 1);
    }, 0);

    var invoiceHtml =
      '<!DOCTYPE html><html><head><title>Invoice - ' + (order.id || 'Order') + '</title>' +
      '<style>' +
      'body{font-family:Arial,sans-serif;padding:40px;color:#333}' +
      'h1{color:#088178;margin:0 0 8px}' +
      '.header{display:flex;justify-content:space-between;margin-bottom:30px}' +
      'table{width:100%;border-collapse:collapse;margin:20px 0}' +
      'th{background:#f8fafc;padding:10px;text-align:left;border-bottom:2px solid #e5e7eb}' +
      '.total-row{font-weight:700;font-size:18px}' +
      '.footer{margin-top:40px;font-size:12px;color:#94a3b8;text-align:center}' +
      '</style></head><body>' +
      '<div class="header">' +
      '<div><h1>Cara</h1><p>E-Commerce Platform</p></div>' +
      '<div style="text-align:right">' +
      '<h2>INVOICE</h2>' +
      '<p><strong>Order ID:</strong> ' + (order.id || 'N/A') + '</p>' +
      '<p><strong>Date:</strong> ' + (order.date || new Date().toLocaleDateString()) + '</p>' +
      '</div></div>' +
      '<div style="margin-bottom:20px">' +
      '<p><strong>Bill To:</strong></p>' +
      '<p>' + (order.customerName || 'Customer') + '</p>' +
      '<p>' + (order.customerEmail || '') + '</p>' +
      '<p>' + (order.customerAddress || '') + '</p>' +
      '</div>' +
      '<table><thead><tr>' +
      '<th style="text-align:left">Item</th>' +
      '<th style="text-align:center">Qty</th>' +
      '<th style="text-align:right">Price</th>' +
      '<th style="text-align:right">Total</th>' +
      '</tr></thead><tbody>' +
      itemsHtml +
      '<tr class="total-row">' +
      '<td colspan="3" style="padding:10px;text-align:right">Grand Total:</td>' +
      '<td style="padding:10px;text-align:right;color:#088178">$' + total.toFixed(2) + '</td>' +
      '</tr>' +
      '</tbody></table>' +
      '<div class="footer">' +
      '<p>Thank you for shopping with Cara!</p>' +
      '<p>This is a computer-generated invoice.</p>' +
      '</div></body></html>';

    var printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      setTimeout(function () {
        printWindow.print();
      }, 500);
    }
  }

  function init() {
    document.querySelectorAll('[data-print-invoice]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var orderId = this.dataset.orderId || 'ORD-' + Date.now();
        var orderData;
        try {
          orderData = JSON.parse(this.dataset.orderJson || '{}');
        } catch (err) {
          orderData = {};
        }
        orderData.id = orderId;
        orderData.date = orderData.date || new Date().toLocaleDateString();
        generateInvoice(orderData);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraInvoice = { generate: generateInvoice };
})();
