/**
 * Collaborative Real-Time Shared Shopping Cart & Group Session via WebSockets
 * 
 * Manages WebSocket group shopping room sessions, user presence avatars,
 * dual-way cart synchronization, and automatic reconnection.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SharedCartWS = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function _wsEscape(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _secureRandomString(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const arr = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(arr);
      return Array.from(arr, (n) => charset[n % charset.length]).join('');
    }
    const stamp = Date.now().toString(36);
    return (stamp + '000000000000').slice(0, length);
  }

  function _safeBadgeColor(input) {
    const color = String(input || '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#088178';
  }

  function generateSessionId() {
    return 'room_' + _secureRandomString(7);
  }

  function getQuerySessionId() {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('session');
  }

  class SharedCartWS {
    constructor(options = {}) {
      this.sessionId = options.sessionId || getQuerySessionId() || null;
      this.wsUrl = options.wsUrl || this.buildWsUrl(this.sessionId);
      this.userId = options.userId || 'user_' + _secureRandomString(5);
      this.userName = options.userName || 'Shopper ' + this.userId.slice(-3);
      this.userColor = options.userColor || _safeBadgeColor('#' + _secureRandomString(6));
      this.ws = null;
      this.activeUsers = [];
      this.onMessageCallback = options.onMessage || null;
      this.onPresenceCallback = options.onPresence || null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;

      if (this.sessionId) {
        this.connect();
      }
    }

    buildWsUrl(sessionId) {
      if (typeof window === 'undefined') return '';
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:8000';
      return `${protocol}//${host}/ws/cart/${sessionId}`;
    }

    createSession() {
      this.sessionId = generateSessionId();
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.set('session', this.sessionId);
        window.history.pushState({}, '', url);
      }
      this.connect();
      return this.sessionId;
    }

    connect() {
      if (!this.sessionId || typeof WebSocket === 'undefined') return;

      const fullUrl = `${this.wsUrl}?user_id=${this.userId}&user_name=${encodeURIComponent(this.userName)}&user_color=${encodeURIComponent(this.userColor)}`;

      try {
        this.ws = new WebSocket(fullUrl);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.broadcast({ type: 'PING_SYNC' });
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            this.handleIncomingMessage(msg);
          } catch (e) {
            // ignore malformed message
          }
        };

        this.ws.onclose = () => {
          this.scheduleReconnect();
        };

        this.ws.onerror = () => {
          if (this.ws) this.ws.close();
        };
      } catch (e) {
        this.scheduleReconnect();
      }
    }

    scheduleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000;
        setTimeout(() => this.connect(), delay);
      }
    }

    handleIncomingMessage(msg) {
      if (!msg || typeof msg.type !== 'string') return;
      if (msg.type === 'USER_JOINED' || msg.type === 'USER_LEFT') {
        this.activeUsers = msg.active_users || [];
        if (typeof this.onPresenceCallback === 'function') {
          this.onPresenceCallback(this.activeUsers);
        }
      }

      if (typeof this.onMessageCallback === 'function') {
        this.onMessageCallback(msg);
      }
    }

    broadcast(payload) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(payload));
      }
    }

    getStatus() {
      return {
        sessionId: this.sessionId,
        wsReadyState: this.ws ? this.ws.readyState : null,
        activeUserCount: this.activeUsers.length,
        reconnectAttempts: this.reconnectAttempts,
      };
    }

    renderPresenceBar(containerSelector) {
      const el = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!el) return;

      const box = document.createElement('div');
      box.className = 'shared-cart-presence-box';
      box.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px;background:rgba(8,129,120,0.08);border-radius:10px;margin-bottom:15px;';

      const avatarsWrap = document.createElement('div');
      avatarsWrap.style.cssText = 'display:flex;margin-left:8px;';
      if (!Array.isArray(this.activeUsers) || this.activeUsers.length === 0) {
        const empty = document.createElement('span');
        empty.style.fontSize = '13px';
        empty.textContent = 'No other shoppers';
        avatarsWrap.appendChild(empty);
      } else {
        this.activeUsers.forEach((u) => {
          const safeName = String(u && u.name ? u.name : '');
          const badge = document.createElement('div');
          badge.className = 'user-avatar-badge';
          badge.style.cssText = `background:${_safeBadgeColor(u && u.color)};color:white;width:32px;height:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid white;margin-left:-8px;`;
          badge.title = safeName;
          badge.textContent = (safeName || 'S').charAt(0).toUpperCase();
          avatarsWrap.appendChild(badge);
        });
      }
      box.appendChild(avatarsWrap);

      const status = document.createElement('span');
      status.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-primary);';
      status.textContent = `${this.activeUsers.length} Active Collaborator${this.activeUsers.length === 1 ? '' : 's'}`;
      box.appendChild(status);

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'copy-session-link-btn';
      copyBtn.style.cssText = 'margin-left:auto;background:var(--accent);color:white;border:none;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer;';
      copyBtn.textContent = 'Invite Friends';
      box.appendChild(copyBtn);

      el.replaceChildren(box);

      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            alert('Shared shopping room link copied to clipboard!');
          }
        });
      }
    }
  }

  return {
    SharedCartWS,
    generateSessionId,
    getSharedCartWsStatusHelper70,
  };
});

function getSharedCartWsStatusHelper70() {
  return {
    status: 'active',
    wsAvailable: typeof WebSocket !== 'undefined',
    broadcastChannelAvailable: typeof BroadcastChannel !== 'undefined',
  };
}
