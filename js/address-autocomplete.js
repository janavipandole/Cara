/**
 * address-autocomplete.js
 * Enables real-time address suggestion dropdown on checkout.html.
 *
 * Connects the street address input field to the mock autocomplete API
 * (/api/address/suggest) and auto-populates City and Zip Code inputs.
 */

(function () {
  'use strict';

  const DEBOUNCE_MS = 300;
  const SUGGEST_API = '/api/address/suggest';

  // ── DOM References ─────────────────────────────────────────────────────────
  const addressInput = document.getElementById('address');
  const cityInput    = document.getElementById('city');
  const zipInput     = document.getElementById('zip');

  let listContainer  = null;
  let debounceTimer  = null;

  // ── Utility: debounce ──────────────────────────────────────────────────────
  function debounce(fn, wait) {
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ── Create suggestions dropdown markup ─────────────────────────────────────
  function showSuggestions(list) {
    if (!addressInput) return;
    ensureContainer();

    if (list.length === 0) {
      hideSuggestions();
      return;
    }

    listContainer.innerHTML = list
      .map(
        (addr, idx) => `
      <div class="autocomplete-suggestion" data-index="${idx}" tabindex="0" role="option">
        <strong>${escapeHTML(addr.street)}</strong>, ${escapeHTML(addr.city)} (${escapeHTML(addr.zip)})
      </div>`,
      )
      .join('');

    listContainer.style.display = 'block';

    // Click handler for selections
    listContainer.querySelectorAll('.autocomplete-suggestion').forEach((el) => {
      el.addEventListener('click', function () {
        const item = list[parseInt(this.dataset.index, 10)];
        selectItem(item);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          const item = list[parseInt(this.dataset.index, 10)];
          selectItem(item);
        }
      });
    });
  }

  function selectItem(item) {
    if (addressInput) addressInput.value = item.street;
    if (cityInput) {
      cityInput.value = item.city;
      cityInput.dispatchEvent(new Event('input')); // trigger validation
    }
    if (zipInput) {
      zipInput.value = item.zip;
      zipInput.dispatchEvent(new Event('input')); // trigger validation
    }
    hideSuggestions();
  }

  function hideSuggestions() {
    if (listContainer) {
      listContainer.style.display = 'none';
      listContainer.innerHTML = '';
    }
  }

  function ensureContainer() {
    if (listContainer) return;
    listContainer = document.createElement('div');
    listContainer.className = 'autocomplete-suggestions-list';
    listContainer.setAttribute('role', 'listbox');
    listContainer.setAttribute('aria-label', 'Address suggestions');

    // Position suggestions list relative to address input wrapper
    const wrapper = addressInput.closest('.input-group') || addressInput.parentElement;
    wrapper.style.position = 'relative';
    wrapper.appendChild(listContainer);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Fetch suggestions ──────────────────────────────────────────────────────
  async function fetchSuggestions() {
    const val = addressInput.value.trim();
    if (val.length < 3) {
      hideSuggestions();
      return;
    }

    try {
      const res = await fetch(`${SUGGEST_API}?q=${encodeURIComponent(val)}`);
      if (!res.ok) throw new Error('API error');
      const list = await res.json();
      showSuggestions(list);
    } catch {
      hideSuggestions();
    }
  }

  // ── Initialise ─────────────────────────────────────────────────────────────
  function init() {
    if (!addressInput) return;

    addressInput.addEventListener('input', debounce(fetchSuggestions, DEBOUNCE_MS));

    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
      if (listContainer && !listContainer.contains(e.target) && e.target !== addressInput) {
        hideSuggestions();
      }
    });

    // Style for the dropdown menu
    const style = document.createElement('style');
    style.textContent = `
      .autocomplete-suggestions-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        z-index: 999;
        display: none;
        max-height: 200px;
        overflow-y: auto;
        margin-top: 4px;
      }
      .autocomplete-suggestion {
        padding: 10px 14px;
        cursor: pointer;
        font-size: 0.85rem;
        color: #1a1a1a;
        transition: background 0.15s;
        border-bottom: 1px solid #f3f4f6;
      }
      .autocomplete-suggestion:last-child {
        border-bottom: none;
      }
      .autocomplete-suggestion:hover,
      .autocomplete-suggestion:focus {
        background: #f3f4f6;
        outline: none;
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
