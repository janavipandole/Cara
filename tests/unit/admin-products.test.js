import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('admin-products.js — AdminProducts API', () => {
  beforeEach(() => {
    vi.resetModules();
    global.fetch = vi.fn();
    global.console.error = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockResponse(data, ok = true) {
    return {
      ok,
      json: () => Promise.resolve(data),
    };
  }

  it('create() calls POST /api/admin/products/', async () => {
    await import('../../js/admin-products.js');
    fetch.mockResolvedValue(mockResponse({ id: 1, name: 'Test Product' }));
    const result = await window.AdminProducts.create({
      name: 'Test Product',
      price: 99,
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({ id: 1, name: 'Test Product' });
  });

  it('update() calls PUT /api/admin/products/:id', async () => {
    await import('../../js/admin-products.js');
    fetch.mockResolvedValue(mockResponse({ id: 5, name: 'Updated Product' }));
    const result = await window.AdminProducts.update(5, {
      name: 'Updated Product',
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/5'),
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(result).toEqual({ id: 5, name: 'Updated Product' });
  });

  it('delete() calls DELETE /api/admin/products/:id', async () => {
    await import('../../js/admin-products.js');
    fetch.mockResolvedValue(mockResponse({}));
    await window.AdminProducts.delete(3);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/3'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('updateStock() calls PATCH /api/admin/products/:id/stock', async () => {
    await import('../../js/admin-products.js');
    fetch.mockResolvedValue(mockResponse({ id: 7, stock: 50 }));
    const result = await window.AdminProducts.updateStock(7, 50);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/7/stock?stock=50'),
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result).toEqual({ id: 7, stock: 50 });
  });

  it('create() throws when response is not ok', async () => {
    await import('../../js/admin-products.js');
    fetch.mockResolvedValue(mockResponse({ detail: 'Unauthorized' }, false));
    await expect(window.AdminProducts.create({ name: 'X' })).rejects.toThrow(
      'Unauthorized',
    );
  });
});
