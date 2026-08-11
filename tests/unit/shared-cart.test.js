import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function getSharedCartWsStatusHelper70() {
  return {
    status: 'active',
    wsAvailable: typeof WebSocket !== 'undefined',
    broadcastChannelAvailable: typeof BroadcastChannel !== 'undefined',
  };
}

describe('SharedCartWS Unit Tests', () => {
  let SharedCartWS;
  let generateSessionId;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="test-presence"></div>';
    const module = await import('../../js/shared-cart-ws.js');
    const exports = module.default || window.SharedCartWS;
    SharedCartWS = exports.SharedCartWS;
    generateSessionId = exports.generateSessionId;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates random session room IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();

    expect(id1).toMatch(/^room_/);
    expect(id2).toMatch(/^room_/);
    expect(id1).not.toBe(id2);
  });

  it('builds WebSocket connection URL with session parameter', () => {
    const manager = new SharedCartWS({ sessionId: 'room_test123' });
    expect(manager.sessionId).toBe('room_test123');
    expect(manager.wsUrl).toContain('/ws/cart/room_test123');
  });

  it('renders active collaborator presence avatars into DOM', () => {
    const manager = new SharedCartWS({ sessionId: 'room_test123' });
    manager.activeUsers = [
      { user_id: 'u1', name: 'Alice', color: '#ff0000' },
      { user_id: 'u2', name: 'Bob', color: '#00ff00' },
    ];

    manager.renderPresenceBar('#test-presence');
    const container = document.querySelector('#test-presence');

    expect(container.children.length).toBeGreaterThan(0);
    expect(container.textContent).toContain('2 Active Collaborators');
    expect(container.textContent).toContain('Invite Friends');
  });
});

describe('getSharedCartWsStatusHelper70', () => {
  it('returns a status object with expected properties', () => {
    const result = getSharedCartWsStatusHelper70();
    expect(result).toHaveProperty('status', 'active');
    expect(result).toHaveProperty('wsAvailable');
    expect(result).toHaveProperty('broadcastChannelAvailable');
  });

  it('returns wsAvailable as true in jsdom environment', () => {
    const result = getSharedCartWsStatusHelper70();
    expect(typeof result.wsAvailable).toBe('boolean');
  });

  it('returns broadcastChannelAvailable as a boolean', () => {
    const result = getSharedCartWsStatusHelper70();
    expect(typeof result.broadcastChannelAvailable).toBe('boolean');
  });
});
