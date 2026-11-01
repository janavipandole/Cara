import { describe, test, expect } from 'vitest';

function verifyOrderOwnership(order, currentUserId, isAdmin) {
  if (isAdmin) return true;
  if (!order || typeof order !== 'object') return false;
  if (!currentUserId) return false;

  var ownerId = order.userId || order.user_id || order.ownerId || order.customerId;
  return String(ownerId) === String(currentUserId);
}

describe('BOLA / Object-Level Authorization Security Defense', () => {
  test('authorizes order access for matching user ID', () => {
    const order = { id: 'ord_101', userId: 'usr_abc' };
    expect(verifyOrderOwnership(order, 'usr_abc', false)).toBe(true);
  });

  test('blocks cross-account order access attempts for non-owner', () => {
    const order = { id: 'ord_101', userId: 'usr_abc' };
    expect(verifyOrderOwnership(order, 'usr_attacker', false)).toBe(false);
  });

  test('allows admin override for any order resource', () => {
    const order = { id: 'ord_101', userId: 'usr_abc' };
    expect(verifyOrderOwnership(order, 'admin_99', true)).toBe(true);
  });

  test('handles missing or malformed order payloads safely', () => {
    expect(verifyOrderOwnership(null, 'usr_abc', false)).toBe(false);
    expect(verifyOrderOwnership({}, 'usr_abc', false)).toBe(false);
    expect(verifyOrderOwnership({ id: 'ord_1' }, null, false)).toBe(false);
  });

  test('recognizes alternate owner id key formats', () => {
    expect(verifyOrderOwnership({ userId: 'usr_1' }, 'usr_1', false)).toBe(true);
    expect(verifyOrderOwnership({ user_id: 'usr_2' }, 'usr_2', false)).toBe(true);
    expect(verifyOrderOwnership({ ownerId: 'usr_3' }, 'usr_3', false)).toBe(true);
    expect(verifyOrderOwnership({ customerId: 'usr_4' }, 'usr_4', false)).toBe(true);
  });

  test('compares owner ids as strings to handle mixed types', () => {
    expect(verifyOrderOwnership({ userId: 12345 }, '12345', false)).toBe(true);
    expect(verifyOrderOwnership({ userId: 'usr_abc' }, 999, false)).toBe(false);
  });
});
