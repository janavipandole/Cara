import { describe, test, expect } from 'vitest';

function verifyOrderOwnership(order, currentUserId, isAdmin) {
  if (isAdmin) return true;
  if (!order || typeof order !== 'object') return false;
  if (!currentUserId) return false;

  var ownerId =
    order.userId || order.user_id || order.ownerId || order.customerId;
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
});
