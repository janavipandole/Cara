/**
 * Address Autocomplete Loading Indicator Utility
 * Handles setting and toggling visual loading indicators on inputs.
 */
class AutocompleteLoader {
  constructor(loadingElement) {
    this.loadingEl = loadingElement || null;
  }

  showLoader() {
    if (this.loadingEl) {
      this.loadingEl.style.display = 'block';
      this.loadingEl.setAttribute('aria-busy', 'true');
    }
  }

  hideLoader() {
    if (this.loadingEl) {
      this.loadingEl.style.display = 'none';
      this.loadingEl.setAttribute('aria-busy', 'false');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AutocompleteLoader };
} else if (typeof window !== 'undefined') {
  window.AutocompleteLoader = AutocompleteLoader;
}
