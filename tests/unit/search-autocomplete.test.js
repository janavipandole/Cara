import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchAutocomplete } from '../../js/search-autocomplete.js';

describe('js/search-autocomplete.js SearchAutocomplete Engine Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should debounce rapid search inputs by 300ms', async () => {
    const onResults = vi.fn();
    const searchEngine = new SearchAutocomplete({
      debounceMs: 300,
      onResults,
    });

    const mockFetch = vi.fn().mockResolvedValue(['Dress 1', 'Dress 2']);

    searchEngine.handleInput('D', mockFetch);
    searchEngine.handleInput('DR', mockFetch);
    searchEngine.handleInput('DRE', mockFetch);
    searchEngine.handleInput('DRESS', mockFetch);

    // Before 300ms, no fetch call should have occurred
    expect(mockFetch).not.toHaveBeenCalled();

    // Fast-forward 300ms
    await vi.advanceTimersByTimeAsync(300);

    // Should only be executed ONCE for the final query 'DRESS'
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('DRESS', expect.any(Object));
  });

  it('should trigger AbortController signal when inflight request is active', async () => {
    let capturedSignal = null;
    const mockFetch = vi.fn((query, signal) => {
      capturedSignal = signal;
      return new Promise((resolve) => setTimeout(() => resolve(['Item']), 500));
    });

    const searchEngine = new SearchAutocomplete({
      debounceMs: 300,
    });

    searchEngine.handleInput('Query1', mockFetch);
    await vi.advanceTimersByTimeAsync(300); // Triggers executeSearch for Query1

    expect(capturedSignal).not.toBeNull();
    expect(capturedSignal.aborted).toBe(false);

    // User types new query before Query1 completes
    searchEngine.handleInput('Query2', mockFetch);

    // Query1 signal should immediately be aborted
    expect(capturedSignal.aborted).toBe(true);
  });

  it('should prevent out-of-order delayed network responses from updating UI state', async () => {
    const resultsLog = [];
    const searchEngine = new SearchAutocomplete({
      debounceMs: 100,
      onResults: (results, query) => {
        resultsLog.push({ query, results });
      },
    });

    // Mock out-of-order latency: query 'DR' takes 600ms, query 'DRESS' takes 200ms
    const mockFetch = vi.fn((query, signal) => {
      const delay = query === 'DR' ? 600 : 200;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (signal.aborted) {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            reject(err);
          } else {
            resolve([`Result for ${query}`]);
          }
        }, delay);

        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          const err = new Error('Aborted');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    searchEngine.handleInput('DR', mockFetch);
    await vi.advanceTimersByTimeAsync(100);

    searchEngine.handleInput('DRESS', mockFetch);
    await vi.advanceTimersByTimeAsync(100);

    // Advance 300ms (total 500ms): 'DRESS' completes
    await vi.advanceTimersByTimeAsync(300);

    // Advance remaining time for 'DR'
    await vi.advanceTimersByTimeAsync(300);

    // UI results log should only contain results for 'DRESS', never 'DR'
    expect(resultsLog.length).toBe(1);
    expect(resultsLog[0].query).toBe('DRESS');
    expect(resultsLog[0].results).toEqual(['Result for DRESS']);
  });
});
