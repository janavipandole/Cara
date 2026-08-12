import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('shared-cart-ws', () => {
  describe('generateSessionId', () => {
    it('returns a string starting with room_', () => {
      const result = window.SharedCartWS.generateSessionId();
      expect(typeof result).toBe('string');
      expect(result.startsWith('room_')).toBe(true);
    });

    it('generates a 7-character random suffix', () => {
      const result = window.SharedCartWS.generateSessionId();
      const suffix = result.replace('room_', '');
      expect(suffix.length).toBe(7);
    });

    it('generates unique IDs on repeated calls', () => {
      const id1 = window.SharedCartWS.generateSessionId();
      const id2 = window.SharedCartWS.generateSessionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('SharedCartWS constructor', () => {
    it('creates an instance with default options', () => {
      const ws = new window.SharedCartWS({});
      expect(ws.sessionId).toBeNull();
      expect(ws.activeUsers).toEqual([]);
      expect(ws.reconnectAttempts).toBe(0);
      expect(ws.maxReconnectAttempts).toBe(5);
    });

    it('uses provided sessionId option', () => {
      const ws = new window.SharedCartWS({ sessionId: 'room_test123' });
      expect(ws.sessionId).toBe('room_test123');
    });

    it('does not call connect when sessionId is null', () => {
      const ws = new window.SharedCartWS({ sessionId: null });
      expect(ws.ws).toBeNull();
    });
  });

  describe('getStatus', () => {
    it('returns an object with expected keys', () => {
      const ws = new window.SharedCartWS({ sessionId: 'room_test123' });
      const status = ws.getStatus();
      expect(status).toHaveProperty('sessionId');
      expect(status).toHaveProperty('wsReadyState');
      expect(status).toHaveProperty('activeUserCount');
      expect(status).toHaveProperty('reconnectAttempts');
    });

    it('returns the correct sessionId', () => {
      const ws = new window.SharedCartWS({ sessionId: 'room_abc1234' });
      expect(ws.getStatus().sessionId).toBe('room_abc1234');
    });

    it('returns null for wsReadyState when ws is not connected', () => {
      const ws = new window.SharedCartWS({});
      expect(ws.getStatus().wsReadyState).toBeNull();
    });

    it('returns 0 activeUserCount when no users', () => {
      const ws = new window.SharedCartWS({});
      expect(ws.getStatus().activeUserCount).toBe(0);
    });
  });

  describe('broadcast', () => {
    it('does not throw when ws is null', () => {
      const ws = new window.SharedCartWS({});
      expect(() => ws.broadcast({ type: 'PING' })).not.toThrow();
    });

    it('does not throw when ws is closed', () => {
      const ws = new window.SharedCartWS({ sessionId: 'room_test123' });
      ws.ws = { readyState: 3 }; // WebSocket.CLOSED
      expect(() => ws.broadcast({ type: 'PING' })).not.toThrow();
    });
  });
});
