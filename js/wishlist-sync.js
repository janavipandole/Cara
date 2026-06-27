/**
 * wishlist-sync.js
 * Synchronises the Cara wishlist between localStorage (for unauthenticated users)
 * and the server-side API (for authenticated users with a session cookie).
 *
 * Behaviour:
 *  - On page load, checks if the user is logged in via /api/auth/me.
 *  - If authenticated:
 *      1. Fetches server wishlist and merges any pending localStorage items.
 *      2. Replaces all heart / save-button UI with server state.
 *      3. Clears the localStorage wishlist after migration.
 *  - If not authenticated:
 *      - Falls back to localStorage wishlist (existing behaviour, untouched).
 *
 * Integration:
 *  1. Include this script in wishlist.html and singleProduct.html after the DOM.
 *  2. Call `WishlistSync.toggle(productId)` from product buttons instead of
 *     directly writing to localStorage.
 *  3. Call `WishlistSync.isInWishlist(productId)` to read current state.
 */

const WishlistSync = (() => {
  'use strict';

  const STORAGE_KEY = 'cara_wishlist';
  const API_BASE = '/api/wishlist';
  let _authenticated = null;   // null = unknown, true/false after check
  let _serverState = new Set(); // product ids in server wishlist

  // ── Private helpers ────────────────────────────────────────────────────────

  function _localGet() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function _localSet(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  function _localAdd(id) {
    const ids = _localGet();
    if (!ids.includes(id)) {
      ids.push(id);
      _localSet(ids);
    }
  }

  function _localRemove(id) {
    _localSet(_localGet().filter((i) => i !== id));
  }

  function _apiFetch(path, method = 'GET') {
    return fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Check authentication ────────────────────────────────────────────────────

  async function _checkAuth() {
    if (_authenticated !== null) return _authenticated;
    try {
      const resp = await fetch('/api/auth/me', { credentials: 'include' });
      _authenticated = resp.ok;
    } catch {
      _authenticated = false;
    }
    return _authenticated;
  }

  // ── Load server wishlist into _serverState ────────────────────────────────

  async function _loadServerState() {
    try {
      let page = 1;
      const pageSize = 100;
      while (true) {
        const resp = await _apiFetch(`/?page=${page}&page_size=${pageSize}`);
        if (!resp.ok) break;
        const body = await resp.json();
        body.items.forEach((item) => _serverState.add(item.product.id));
        if (page * pageSize >= body.total) break;
        page++;
      }
    } catch (err) {
      console.warn('[WishlistSync] Failed to load server state:', err);
    }
  }

  // ── Migrate localStorage items to server ───────────────────────────────────

  async function _migratePendingItems() {
    const pendingIds = _localGet();
    if (pendingIds.length === 0) return;

    await Promise.allSettled(
      pendingIds.map((id) =>
        _apiFetch(`/${id}`, 'POST').then(async (resp) => {
          if (resp.ok) {
            const body = await resp.json();
            if (body.in_wishlist) _serverState.add(id);
          }
        }),
      ),
    );

    // Clear localStorage wishlist after successful migration
    _localSet([]);
    console.info(`[WishlistSync] Migrated ${pendingIds.length} pending item(s) to server.`);
  }

  // ── Update all heart/save buttons on the current page ─────────────────────

  function _refreshUI() {
    document.querySelectorAll('[data-wishlist-id]').forEach((btn) => {
      const id = parseInt(btn.dataset.wishlistId, 10);
      const active = isInWishlist(id);
      btn.classList.toggle('wishlisted', active);
      btn.setAttribute('aria-pressed', String(active));
      btn.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Initialise WishlistSync.
   * Must be called once on DOMContentLoaded.
   */
  async function init() {
    const authed = await _checkAuth();
    if (authed) {
      await _loadServerState();
      await _migratePendingItems();
    }
    _refreshUI();
  }

  /**
   * Toggle a product in the wishlist.
   * @param {number} productId
   * @returns {Promise<boolean>} New in_wishlist state.
   */
  async function toggle(productId) {
    const authed = await _checkAuth();

    if (!authed) {
      // Unauthenticated: operate on localStorage
      const ids = _localGet();
      const idx = ids.indexOf(productId);
      if (idx === -1) {
        _localAdd(productId);
        _refreshUI();
        return true;
      } else {
        _localRemove(productId);
        _refreshUI();
        return false;
      }
    }

    // Authenticated: call server toggle endpoint
    try {
      const resp = await _apiFetch(`/${productId}`, 'POST');
      if (!resp.ok) {
        throw new Error(`Wishlist toggle failed: ${resp.status}`);
      }
      const body = await resp.json();
      if (body.in_wishlist) {
        _serverState.add(productId);
      } else {
        _serverState.delete(productId);
      }
      _refreshUI();
      return body.in_wishlist;
    } catch (err) {
      console.error('[WishlistSync] Toggle error:', err);
      throw err;
    }
  }

  /**
   * Check whether a product is currently in the wishlist.
   * Synchronous — use after init() has resolved.
   * @param {number} productId
   * @returns {boolean}
   */
  function isInWishlist(productId) {
    if (_authenticated) {
      return _serverState.has(productId);
    }
    return _localGet().includes(productId);
  }

  /**
   * Return the total number of items in the wishlist.
   * @returns {number}
   */
  function count() {
    if (_authenticated) return _serverState.size;
    return _localGet().length;
  }

  // Expose as module
  return { init, toggle, isInWishlist, count };
})();

// Auto-initialise on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => WishlistSync.init());
