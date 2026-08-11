import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ReceiptExporter Unit Tests', () => {
  let ReceiptExporter;
  let fetchDigitalReceipt;
  let generatePrintableHTML;

  beforeEach(async () => {
    vi.resetModules();
    const module = await import('../../js/receipt-exporter.js');
    const exports = module.default || window.ReceiptExporter;
    ReceiptExporter = exports;
    fetchDigitalReceipt = exports.fetchDigitalReceipt;
    generatePrintableHTML = exports.generatePrintableHTML;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates local receipt fallback data correctly', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('API offline'));

    const receipt = await fetchDigitalReceipt(101, {
      orderData: {
        fullName: 'John Smith',
        email: 'john@example.com',
        totalAmount: 199.99,
        items: [{ name: 'Jacket', quantity: 1, price: 199.99 }],
      },
    });

    expect(receipt.order_id).toBe(101);
    expect(receipt.full_name).toBe('John Smith');
    expect(receipt.total_amount).toBe(199.99);
    expect(receipt.signature).toMatch(/^sig_/);
  });

  it('generates valid printable HTML receipt string', () => {
    const mockReceipt = {
      order_id: 202,
      full_name: 'Alice Brown',
      email: 'alice@example.com',
      total_amount: 120.0,
      status: 'DELIVERED',
      created_at: '2026-08-10T12:00:00Z',
      signature: 'mock_signature_abc123',
      items: [{ product_name: 'Dress', quantity: 1, price: 120.0 }],
    };

    const html = generatePrintableHTML(mockReceipt);

    expect(html).toContain('Receipt - Order #202');
    expect(html).toContain('Alice Brown');
    expect(html).toContain('$120.00');
    expect(html).toContain('mock_signature_abc123');
  });

  it('verifies receipt signature with backend', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ valid: true, order_id: 202 }),
    });

    const res = await ReceiptExporter.verifyReceiptSignature('mock_signature_abc123');
    expect(res.valid).toBe(true);
    expect(res.order_id).toBe(202);
  });
});
