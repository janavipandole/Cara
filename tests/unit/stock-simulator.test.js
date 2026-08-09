import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getStockInfo,
  startStockReservationTimer,
} from '../../js/stock-simulator.js';

describe('Stock Simulator Unit Tests', () => {
  it('should return normal stock info for a plentiful count', () => {
    const info = getStockInfo(15);
    expect(info).toEqual({ count: 15, status: 'normal' });
  });

  it('should return low stock info for a low count', () => {
    const info = getStockInfo(2);
    expect(info.status).toBe('low');
    expect(info.count).toBe(2);
  });

  it('should return out of stock status for a zero count', () => {
    const info = getStockInfo(0);
    expect(info.status).toBe('out');
    expect(info.count).toBe(0);
  });

  it('should return out of stock for negative counts', () => {
    const info = getStockInfo(-3);
    expect(info.status).toBe('out');
  });

  it('should return unknown status for non-numeric stock', () => {
    const info = getStockInfo(null);
    expect(info).toEqual({ count: 0, status: 'unknown' });
    const infoEmpty = getStockInfo(undefined);
    expect(infoEmpty).toEqual({ count: 0, status: 'unknown' });
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

  it('should expire immediately for a zero or negative duration', () => {
    const onTick = vi.fn();
    const onExpire = vi.fn();
    const intervalZero = startStockReservationTimer(0, onTick, onExpire);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onTick).not.toHaveBeenCalled();
    expect(intervalZero).toBeNull();

    const intervalNegative = startStockReservationTimer(-5, onTick, onExpire);
    expect(onExpire).toHaveBeenCalledTimes(2);
    expect(intervalNegative).toBeNull();
  });
});
