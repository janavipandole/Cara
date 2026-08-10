import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = `
    <div class="blog-box">
      <div class="blog-details">A blog post description with a few words.</div>
    </div>
  `;
});

async function load() {
  await import('../../js/reading-progress.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('reading-progress', () => {
  it('creates the reading progress bar element', async () => {
    await load();
    expect(document.getElementById('reading-progress-bar')).toBeTruthy();
  });

  it('adds a read-time label to blog post details', async () => {
    document.querySelector('.blog-details').textContent =
      Array(201).fill('word').join(' ');
    await load();
    expect(document.querySelector('.blog-details').textContent).toContain(
      'Min Read',
    );
  });

  it('updates the progress bar width as the page scrolls', async () => {
    await load();
    const bar = document.getElementById('reading-progress-bar');
    Object.defineProperty(document.body, 'scrollTop', {
      value: 100,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 600,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    expect(bar.style.width).toBe('50%');
  });

  it('stays at 0% when the page has no scrollable content', async () => {
    await load();
    const bar = document.getElementById('reading-progress-bar');
    // No scroll; scrollHeight equals clientHeight.
    Object.defineProperty(document.body, 'scrollTop', {
      value: 0,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 600,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 600,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    expect(bar.style.width).toBe('0%');
  });
});

import { roundScrollProgressPercent } from '../../js/reading-progress.js';

describe('roundScrollProgressPercent', () => {
  it('rounds a float percentage to nearest integer', () => {
    expect(roundScrollProgressPercent(45.678)).toBe(46);
    expect(roundScrollProgressPercent(45.321)).toBe(45);
  });

  it('clamps to 0 for negative values', () => {
    expect(roundScrollProgressPercent(-10)).toBe(0);
  });

  it('clamps to 100 for values over 100', () => {
    expect(roundScrollProgressPercent(150)).toBe(100);
  });

  it('returns 0 for NaN inputs', () => {
    expect(roundScrollProgressPercent(NaN)).toBe(0);
  });

  it('handles non-number inputs gracefully', () => {
    expect(roundScrollProgressPercent('forty-five')).toBe(0);
    expect(roundScrollProgressPercent(null)).toBe(0);
  });
});
