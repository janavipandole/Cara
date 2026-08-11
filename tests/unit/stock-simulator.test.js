import { describe, it, expect, vi } from 'vitest';
import { getStockInfo, startStockReservationTimer, mockStockData } from '../../js/stock-simulator.js';

describe('Stock Simulator Unit Tests', () => {
  it('shows an error message for an empty restock email', async () => {
    vi.resetModules();
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'complete',
    });
    document.body.innerHTML = `
      <select id="sizeSelect">
        <option value="XL">XL</option>
      </select>
      <div id="stock-alert-container"></div>
    `;
    await import('../../js/stock-simulator.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const select = document.getElementById('sizeSelect');
    select.value = 'XL';
    select.dispatchEvent(new Event('change'));

    document.getElementById('notify-restock-btn').click();
    const feedback = document.getElementById('restock-feedback');
    expect(feedback.textContent).toBe('Please provide a valid email address.');
  });

  it('shows a success message for a filled restock email', async () => {
    vi.resetModules();
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: 'complete',
    });
    document.body.innerHTML = `
      <select id="sizeSelect">
        <option value="XL">XL</option>
      </select>
      <div id="stock-alert-container"></div>
    `;
    await import('../../js/stock-simulator.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const select = document.getElementById('sizeSelect');
    select.value = 'XL';
    select.dispatchEvent(new Event('change'));

    document.getElementById('restock-email').value = 'user@example.com';
    document.getElementById('notify-restock-btn').click();
    const feedback = document.getElementById('restock-feedback');
    expect(feedback.textContent).toBe('Successfully subscribed to Restock alert!');
  });

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

  it('should return unknown status when size parameter is empty or null', () => {
    const infoNull = getStockInfo(null);
    expect(infoNull).toEqual({ count: 0, status: 'unknown' });
    const infoEmpty = getStockInfo('');
    expect(infoEmpty).toEqual({ count: 0, status: 'unknown' });
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

  it('should expire immediately for NaN and Infinity durations', () => {
    const onTick = vi.fn();
    const onExpire = vi.fn();

    const intervalNaN = startStockReservationTimer(NaN, onTick, onExpire);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onTick).not.toHaveBeenCalled();
    expect(intervalNaN).toBeNull();

    const intervalInfinity = startStockReservationTimer(Infinity, onTick, onExpire);
    expect(onExpire).toHaveBeenCalledTimes(2);
    expect(intervalInfinity).toBeNull();
  });

  it('should tick to zero and expire for a one-second duration', () => {
    vi.useFakeTimers();
    const onTick = vi.fn();
    const onExpire = vi.fn();

    const interval = startStockReservationTimer(1, onTick, onExpire);
    expect(interval).not.toBeNull();

    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledWith(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('should return the default stock info for unknown and undefined sizes', () => {
    expect(getStockInfo('UnknownSize')).toEqual({ count: 5, status: 'normal' });
    expect(getStockInfo('Select Size')).toEqual(mockStockData['Select Size']);
    expect(getStockInfo(undefined)).toEqual({ count: 0, status: 'unknown' });
  });
});
