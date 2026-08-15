/**
 * Unit tests for admin-products.js - enhanced coverage
 * Tests the AdminProducts API methods and stock validation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('AdminProducts API', () => {
  let AdminProducts;

  beforeEach(async () => {
    consoleErrorSpy.mockClear();
    vi.resetModules();
    // Set up a mock fetch
    global.fetch = vi.fn();
    // Load the module
    require('../../js/admin-products.js');
    AdminProducts = window.AdminProducts;
  });

  it('updateStock rejects negative stock values', async () => {
    await expect(AdminProducts.updateStock(1, -5)).rejects.toThrow('non-negative');
  });

  it('updateStock rejects non-finite stock values', async () => {
    await expect(AdminProducts.updateStock(1, NaN)).rejects.toThrow('non-negative');
    await expect(AdminProducts.updateStock(1, Infinity)).rejects.toThrow('non-negative');
  });

  it('updateStock accepts valid non-negative stock values', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, stock: 10 }),
    });
    const result = await AdminProducts.updateStock(1, 10);
    expect(result).toEqual({ id: 1, stock: 10 });
  });

  it('create makes a POST request to the products endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 2, name: 'Test Product' }),
    });
    const result = await AdminProducts.create({ name: 'Test Product' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });
});
