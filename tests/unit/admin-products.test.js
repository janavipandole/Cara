import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  delete window.AdminProducts;
  global.fetch = vi.fn();
});

async function load() {
  await import('../../js/admin-products.js');
  return window.AdminProducts;
}

describe('admin-products', () => {
  it('create posts to the admin products endpoint and returns the product', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 11, name: 'Shirt' }),
    });
    const api = await load();
    const res = await api.create({ name: 'Shirt' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(res.name).toBe('Shirt');
  });

  it('delete issues a DELETE request', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ deleted: true }),
    });
    const api = await load();
    await api.delete(7);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/7'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('rejects with the server detail on a non-ok response', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Forbidden' }),
    });
    const api = await load();
    await expect(api.update(1, { name: 'x' })).rejects.toThrow('Forbidden');
  });

  it('updateStock issues a PATCH request with the stock query', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 7, stock: 25 }),
    });
    const api = await load();
    const res = await api.updateStock(7, 25);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/products/7/stock?stock=25'),
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(res.stock).toBe(25);
  });

});
