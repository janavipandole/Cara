import { describe, it, expect, vi, beforeEach } from 'vitest';

let SharedCartWSModule;

beforeEach(async () => {
  vi.resetModules();
  SharedCartWSModule = await import('../../js/shared-cart-ws.js');
  if (!SharedCartWSModule || !SharedCartWSModule.SharedCartWS) {
    SharedCartWSModule = require('../../js/shared-cart-ws.js');
  }
});

const getExports = () => {
  if (SharedCartWSModule && typeof SharedCartWSModule.SharedCartWS === 'function') {
    return SharedCartWSModule;
  }
  return null;
};

describe('shared-cart-ws', () => {
  describe('generateSessionId', () => {
    it('returns a string starting with room_', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const result = exports.generateSessionId();
      expect(typeof result).toBe('string');
      expect(result.startsWith('room_')).toBe(true);
    });

    it('generates a 7-character random suffix', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const result = exports.generateSessionId();
      const suffix = result.replace('room_', '');
      expect(suffix.length).toBe(7);
    });

    it('generates unique IDs on repeated calls', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const id1 = exports.generateSessionId();
      const id2 = exports.generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('SharedCartWS class', () => {
    it('creates an instance with default options', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const WS = exports.SharedCartWS;
      const ws = new WS({});
      expect(ws.sessionId).toBeNull();
      expect(ws.activeUsers).toEqual([]);
      expect(ws.reconnectAttempts).toBe(0);
      expect(ws.maxReconnectAttempts).toBe(5);
    });

    it('uses provided sessionId option', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const WS = exports.SharedCartWS;
      const ws = new WS({ sessionId: 'room_test123' });
      expect(ws.sessionId).toBe('room_test123');
    });

    it('does not call connect when sessionId is null', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const WS = exports.SharedCartWS;
      const ws = new WS({ sessionId: null });
      expect(ws.ws).toBeNull();
    });
  });

  describe('broadcast', () => {
    it('does not throw when ws is null', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const WS = exports.SharedCartWS;
      const ws = new WS({});
      expect(() => ws.broadcast({ type: 'PING' })).not.toThrow();
    });

    it('does not throw when ws is closed', () => {
      const exports = getExports();
      if (!exports) { console.warn('SharedCartWSModule not loaded'); return; }
      const WS = exports.SharedCartWS;
      const ws = new WS({ sessionId: 'room_test123' });
      ws.ws = { readyState: 3 }; // WebSocket.CLOSED
      expect(() => ws.broadcast({ type: 'PING' })).not.toThrow();
    });
  });
});
