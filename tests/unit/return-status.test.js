/**
 * Unit tests for js/return-status.js — the Estimated Return Date
 * policy engine (delivered_at + 30 days).
 *
 * Regression tests for https://github.com/janavipandole/Cara/issues/5578
 */
import { describe, expect, it } from 'vitest';

const ReturnStatus = require('../../js/return-status.js');

const { computeReturnDeadline, getReturnStatus, renderReturnStatus, renderReturnDeadlineInline } =
  ReturnStatus;

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe('computeReturnDeadline', () => {
  it('returns null when no delivery timestamp exists', () => {
    expect(computeReturnDeadline(null)).toBeNull();
    expect(computeReturnDeadline('')).toBeNull();
  });

  it('adds the 30-day policy window to the delivery timestamp', () => {
    const deliveredAt = '2026-08-01T10:00:00.000Z';
    const deadline = computeReturnDeadline(deliveredAt);
    expect(deadline.toISOString()).toBe('2026-08-31T10:00:00.000Z');
  });

  it('respects a custom window', () => {
    const deadline = computeReturnDeadline('2026-08-01T00:00:00.000Z', 45);
    expect(deadline.toISOString()).toBe('2026-09-15T00:00:00.000Z');
  });
});

describe('getReturnStatus', () => {
  it('marks cancelled orders as unavailable', () => {
    const info = getReturnStatus({ status: 'CANCELLED', delivered_at: daysAgo(10) });
    expect(info.state).toBe('unavailable');
    expect(info.canRequestReturn).toBe(false);
  });

  it('reports not-delivered orders as having no window yet', () => {
    const info = getReturnStatus({ status: 'CONFIRMED', delivered_at: null });
    expect(info.state).toBe('not-delivered');
    expect(info.canRequestReturn).toBe(false);
    expect(info.deadline).toBeNull();
  });

  it('flags an in-window delivered order as eligible', () => {
    const info = getReturnStatus({ status: 'DELIVERED', delivered_at: daysAgo(10) });
    expect(info.state).toBe('eligible');
    expect(info.canRequestReturn).toBe(true);
    expect(info.message).toContain('Eligible for return until');
  });

  it('flags an out-of-window delivered order as expired', () => {
    const info = getReturnStatus({ status: 'DELIVERED', delivered_at: daysAgo(40) });
    expect(info.state).toBe('expired');
    expect(info.canRequestReturn).toBe(false);
    expect(info.message).toContain('Return window closed on');
  });
});

describe('renderReturnStatus', () => {
  it('renders an enabled return button while eligible', () => {
    const html = renderReturnStatus({ status: 'DELIVERED', delivered_at: daysAgo(5) });
    expect(html).toContain('return-status--eligible');
    expect(html).toContain('Eligible for return until');
    expect(html).toContain('<button class="return-request-btn" type="button">Request Return</button>');
  });

  it('renders a disabled button once the window closes', () => {
    const html = renderReturnStatus({ status: 'DELIVERED', delivered_at: daysAgo(60) });
    expect(html).toContain('return-status--expired');
    expect(html).toContain('Return window closed on');
    expect(html).toContain('disabled');
    expect(html).toContain('Returns Closed');
  });

  it('renders no return button for non-delivered orders', () => {
    const html = renderReturnStatus({ status: 'CONFIRMED' });
    expect(html).toContain('return-status--not-delivered');
    expect(html).not.toContain('return-request-btn');
  });
});

describe('renderReturnDeadlineInline', () => {
  it('returns empty markup when the order is not delivered', () => {
    expect(renderReturnDeadlineInline({ status: 'CONFIRMED' })).toBe('');
  });

  it('returns a compact deadline for delivered orders', () => {
    const html = renderReturnDeadlineInline({ status: 'DELIVERED', delivered_at: daysAgo(3) });
    expect(html).toContain('return-deadline-inline');
    expect(html).toContain('Eligible for return until');
  });
});
