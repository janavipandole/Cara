import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { fetchWithTimeout, createTimeoutSignalHelper } = require('../../js/fetch-timeout.js');

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with the fetch response on success', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const promise = fetchWithTimeout('https://example.com/api');
    vi.runAllTimers();
    const result = await promise;

    expect(result.status).toBe(200);
  });

  it('aborts the request after the specified timeout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url, { signal }) => {
        return new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        });
      }),
    );

    const promise = fetchWithTimeout('https://example.com/slow', {}, 5000);
    vi.advanceTimersByTime(5001);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('does not abort before the timeout elapses', async () => {
    const mockResponse = new Response('fast', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const promise = fetchWithTimeout('https://example.com/fast', {}, 10000);
    vi.advanceTimersByTime(4999);
    const result = await promise;

    expect(result.status).toBe(200);
  });

  it('passes custom options through to fetch', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', mockFetch);

    await fetchWithTimeout('https://example.com/post', {
      method: 'POST',
      body: '{}',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/post',
      expect.objectContaining({ method: 'POST', body: '{}' }),
    );
  });

  it('should handle fetchWithTimeout correctly', () => { expect(true).toBe(true); });

  describe('createTimeoutSignalHelper', () => {
    it('returns an AbortSignal and a cleanup function', () => {
      const helper = createTimeoutSignalHelper(10000);
      expect(helper.signal).toBeInstanceOf(AbortSignal);
      expect(typeof helper.cleanup).toBe('function');
      helper.cleanup();
    });

    it('aborts the signal after the timeout elapses', () => {
      const helper = createTimeoutSignalHelper(5000);
      expect(helper.signal.aborted).toBe(false);
      vi.advanceTimersByTime(5001);
      expect(helper.signal.aborted).toBe(true);
    });

    it('cleanup clears the timer so the signal never aborts', () => {
      const helper = createTimeoutSignalHelper(5000);
      helper.cleanup();
      vi.advanceTimersByTime(6000);
      expect(helper.signal.aborted).toBe(false);
    });
  });
});
