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

  function generateSessionId() {
    return 'room_' + Math.random().toString(36).substring(2, 9);
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
      this.userId = options.userId || 'user_' + Math.random().toString(36).substring(2, 7);
      this.userName = options.userName || 'Shopper ' + this.userId.slice(-3);
      this.userColor = options.userColor || '#' + Math.floor(Math.random() * 16777215).toString(16);
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

    renderPresenceBar(containerSelector) {
      const el = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!el) return;

      const avatars = this.activeUsers
        .map(
          (u) => `
          <div class="user-avatar-badge" style="background: ${u.color || '#088178'}; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border: 2px solid white; margin-left: -8px;" title="${u.name}">
            ${(u.name || 'S').charAt(0).toUpperCase()}
          </div>
        `
        )
        .join('');

      el.innerHTML = `
        <div class="shared-cart-presence-box" style="display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(8,129,120,0.08); border-radius: 10px; margin-bottom: 15px;">
          <div style="display: flex; margin-left: 8px;">${avatars || '<span style="font-size:13px;">No other shoppers</span>'}</div>
          <span style="font-size: 13px; font-weight: 600; color: var(--text-primary);">
            ${this.activeUsers.length} Active Collaborator${this.activeUsers.length === 1 ? '' : 's'}
          </span>
          <button type="button" class="copy-session-link-btn" style="margin-left: auto; background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: pointer;">
            🔗 Invite Friends
          </button>
        </div>
      `;

      const copyBtn = el.querySelector('.copy-session-link-btn');
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
  };
});


export function getSharedCartWsStatusHelper70() {
  return { status: "ok", fn: "getSharedCartWsStatusHelper70" };
}
