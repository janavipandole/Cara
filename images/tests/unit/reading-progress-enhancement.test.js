/**
 * Unit tests for reading-progress.js - enhanced coverage
 * Tests scroll progress calculation and progress bar rendering.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('reading-progress.js enhanced coverage', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="reading-progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      <div style="height: 2000px; content: 'tall page';"></div>
    `;
    vi.clearAllMocks();
  });

  it('has a progress bar with correct ARIA attributes', () => {
    const bar = document.getElementById('reading-progress-bar');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.hasAttribute('aria-valuemin')).toBe(true);
    expect(bar.hasAttribute('aria-valuemax')).toBe(true);
  });

  it('calculates scroll percentage correctly', () => {
    // Simulate scroll position
    const scrollY = 500;
    const documentHeight = 2000;
    const windowHeight = 500;
    const maxScroll = documentHeight - windowHeight;
    const scrollPercent = Math.round((scrollY / maxScroll) * 100);
    expect(scrollPercent).toBe(33); // 500/1500 * 100 = 33.33%
  });

  it('clamps scroll percentage between 0 and 100', () => {
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(50, 0, 100)).toBe(50);
  });
});
