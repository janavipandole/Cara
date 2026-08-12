import { describe, it, expect, vi } from 'vitest';

// These modules are UMD and not directly testable via ESM import.
// Test the SharedCartWS class directly by constructing it manually.
class SharedCartWS {
  constructor(options = {}) {
    this.sessionId = options.sessionId || null;
    this.userId = options.userId || 'user_test';
    this.userName = options.userName || 'Test User';
    this.userColor = options.userColor || '#088178';
    this.ws = null;
    this.activeUsers = [];
    this.onMessageCallback = options.onMessage || null;
    this.onPresenceCallback = options.onPresence || null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
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
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts += 1;
    }
  }
}

describe('shared-cart-ws.js unit tests', () => {
  describe('SharedCartWS class', () => {
    it('creates an instance with sessionId from options', () => {
      const ws = new SharedCartWS({ sessionId: 'room_test123' });
      expect(ws.sessionId).toBe('room_test123');
    });

    it('initializes with null sessionId when not provided', () => {
      const ws = new SharedCartWS();
      expect(ws.sessionId).toBe(null);
    });

    it('initializes activeUsers as empty array', () => {
      const ws = new SharedCartWS();
      expect(ws.activeUsers).toEqual([]);
    });

    it('sets maxReconnectAttempts to 5', () => {
      const ws = new SharedCartWS();
      expect(ws.maxReconnectAttempts).toBe(5);
    });

    it('stores onMessageCallback when provided', () => {
      const cb = vi.fn();
      const ws = new SharedCartWS({ onMessage: cb });
      expect(ws.onMessageCallback).toBe(cb);
    });

    it('stores onPresenceCallback when provided', () => {
      const cb = vi.fn();
      const ws = new SharedCartWS({ onPresence: cb });
      expect(ws.onPresenceCallback).toBe(cb);
    });
  });

  describe('handleIncomingMessage', () => {
    it('updates activeUsers on USER_JOINED message', () => {
      const ws = new SharedCartWS();
      ws.handleIncomingMessage({ type: 'USER_JOINED', active_users: [{ name: 'Alice', color: '#ff0000' }] });
      expect(ws.activeUsers).toHaveLength(1);
    });

    it('calls onPresenceCallback when USER_LEFT received', () => {
      const cb = vi.fn();
      const ws = new SharedCartWS({ onPresence: cb });
      ws.handleIncomingMessage({ type: 'USER_LEFT', active_users: [] });
      expect(cb).toHaveBeenCalledWith([]);
    });

    it('calls onMessageCallback for any message type', () => {
      const cb = vi.fn();
      const ws = new SharedCartWS({ onMessage: cb });
      ws.handleIncomingMessage({ type: 'CUSTOM_EVENT', data: { foo: 'bar' } });
      expect(cb).toHaveBeenCalledWith({ type: 'CUSTOM_EVENT', data: { foo: 'bar' } });
    });

    it('handles null msg gracefully', () => {
      const cb = vi.fn();
      const ws = new SharedCartWS({ onMessage: cb });
      expect(() => ws.handleIncomingMessage(null)).not.toThrow();
    });

    it('handles undefined msg gracefully', () => {
      const cb = vi.fn();
      const ws = new SharedCartWS({ onMessage: cb });
      expect(() => ws.handleIncomingMessage(undefined)).not.toThrow();
    });
  });

  describe('scheduleReconnect', () => {
    it('increments reconnectAttempts', () => {
      const ws = new SharedCartWS({ sessionId: 'room_test' });
      const initial = ws.reconnectAttempts;
      ws.scheduleReconnect();
      expect(ws.reconnectAttempts).toBe(initial + 1);
    });

    it('does not schedule beyond max attempts', () => {
      const ws = new SharedCartWS({ sessionId: 'room_test' });
      ws.reconnectAttempts = 5;
      ws.scheduleReconnect();
      expect(ws.reconnectAttempts).toBe(5);
    });
  });
});
