import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('OfflineOrderQueue Unit Tests', () => {
  let OfflineOrderQueue;
  let queue;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    const module = await import('../../js/offline-order-queue.js');
    OfflineOrderQueue = module.default || window.OfflineOrderQueue;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly initializes and checks online status', () => {
    queue = new OfflineOrderQueue();
    expect(typeof queue.isOnline()).toBe('boolean');
  });

  it('enqueues an order offline when network fails or is offline', async () => {
    queue = new OfflineOrderQueue();
    const mockOrderPayload = {
      fullName: 'John Doe',
      email: 'john@example.com',
      items: [{ product_id: 1, quantity: 2 }],
    };

    const result = await queue.enqueueOfflineOrder(mockOrderPayload);
    expect(result.success).toBe(true);
    expect(result.isOffline).toBe(true);
    expect(result.offlineId).toMatch(/^off_/);

    const pending = await queue.getPendingOrders();
    expect(pending.length).toBeGreaterThan(0);
  });

  it('flushes pending orders when online and custom submit succeeds', async () => {
    queue = new OfflineOrderQueue();
    const mockOrderPayload = {
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      items: [{ product_id: 5, quantity: 1 }],
    };

    await queue.enqueueOfflineOrder(mockOrderPayload);

    const customSubmitFn = vi.fn().mockResolvedValue({ ok: true, id: 101 });
    vi.spyOn(queue, 'isOnline').mockReturnValue(true);

    await queue.flushPendingOrders(customSubmitFn);

    expect(customSubmitFn).toHaveBeenCalledTimes(1);
    const remaining = await queue.getPendingOrders();
    expect(remaining).toHaveLength(0);
  });

  it('retains pending order in queue if submit fails during flush', async () => {
    queue = new OfflineOrderQueue();
    await queue.enqueueOfflineOrder({ fullName: 'Fail Test' });

    const customSubmitFn = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.spyOn(queue, 'isOnline').mockReturnValue(true);

    await queue.flushPendingOrders(customSubmitFn);

    expect(customSubmitFn).toHaveBeenCalled();
    const remaining = await queue.getPendingOrders();
    expect(remaining.length).toBeGreaterThan(0);
  });
});
