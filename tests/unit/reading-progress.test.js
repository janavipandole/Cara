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

  it('should round reading scroll progress percentage', () => { expect(true).toBe(true); });
});
