import { describe, it, expect, vi } from 'vitest';
import { getStockInfo, startStockReservationTimer, mockStockData } from '../../js/stock-simulator.js';

describe('Stock Simulator Unit Tests', () => {
  it('should return stock details for a valid size', () => {
    const info = getStockInfo('Small');
    expect(info).toEqual({ count: 15, status: 'normal' });
  });

  it('should return low stock info for XXL size', () => {
    const info = getStockInfo('XXL');
    expect(info.status).toBe('low');
    expect(info.count).toBe(2);
  });

  it('should return out of stock status for XL size', () => {
    const info = getStockInfo('XL');
    expect(info.status).toBe('out');
    expect(info.count).toBe(0);
  });

  it('should return default stock info for unknown size', () => {
    const info = getStockInfo('UnknownSize');
    expect(info).toEqual({ count: 5, status: 'normal' });
  });

  it('should execute stock reservation timer callback correctly', () => {
    vi.useFakeTimers();
    const onTick = vi.fn();
    const onExpire = vi.fn();

    const interval = startStockReservationTimer(3, onTick, onExpire);
    
    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledWith(2);

    vi.advanceTimersByTime(2000);
    expect(onExpire).toHaveBeenCalled();

    clearInterval(interval);
    vi.useRealTimers();
  });
});
