/**
 * js/search-autocomplete.js
 * SearchAutocomplete Engine with 300ms Debounce and AbortController Pipeline
 * Fixes Issue #5209: Resolves search race conditions and cancels inflight requests.
 */

class SearchAutocomplete {
  constructor(options = {}) {
    this.debounceMs = options.debounceMs || 300;
    this.minLength = options.minLength || 1;
    this.onSearch = options.onSearch || null;
    this.onResults = options.onResults || null;
    this.onError = options.onError || null;
    this.loader = options.loader || null;

    this.timer = null;
    this.activeController = null;
    this.lastQuery = '';
  }

  /**
   * Triggers a search with 300ms debounce and active AbortController request cancellation.
   * @param {string} query Search input string
   * @param {Function} fetchFn Asynchronous fetch function receiving (query, signal)
   */
  handleInput(query, fetchFn) {
    const trimmed = (query || '').trim();

    // Cancel pending debounce timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Immediately abort any in-flight network request from previous keystrokes
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }

    if (trimmed.length < this.minLength) {
      this.lastQuery = '';
      if (typeof this.onResults === 'function') {
        this.onResults([], trimmed);
      }
      return;
    }

    // Schedule debounced search execution
    this.timer = setTimeout(() => {
      this.executeSearch(trimmed, fetchFn);
    }, this.debounceMs);
  }

  /**
   * Executes the fetch operation with a new AbortController signal.
   */
  async executeSearch(query, fetchFn) {
    // Create new AbortController for this request
    this.activeController = new AbortController();
    const controller = this.activeController;
    this.lastQuery = query;

    if (this.loader && typeof this.loader.showLoader === 'function') {
      this.loader.showLoader();
    }

    try {
      let results = [];
      if (typeof fetchFn === 'function') {
        results = await fetchFn(query, controller.signal);
      } else if (typeof this.onSearch === 'function') {
        results = await this.onSearch(query, controller.signal);
      }

      // Ignore response if this request was aborted or a newer request took over
      if (controller.signal.aborted || controller !== this.activeController) {
        return;
      }

      if (typeof this.onResults === 'function') {
        this.onResults(results, query);
      }
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        // Silently ignore aborted inflight requests
        return;
      }
      if (typeof this.onError === 'function') {
        this.onError(err, query);
      } else {
        console.warn('[SearchAutocomplete] Search failed:', err);
      }
    } finally {
      // Hide loader only if this remains the current active controller
      if (controller === this.activeController) {
        if (this.loader && typeof this.loader.hideLoader === 'function') {
          this.loader.hideLoader();
        }
        this.activeController = null;
      }
    }
  }

  /**
   * Manually abort any running search request and clear timer.
   */
  cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchAutocomplete };
} else if (typeof window !== 'undefined') {
  window.SearchAutocomplete = SearchAutocomplete;
}
