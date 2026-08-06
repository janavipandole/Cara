import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');

describe('CSS consolidation smoke', () => {
  it('ships shared design tokens', () => {
    const tokens = fs.readFileSync(path.join(root, 'css/tokens.css'), 'utf8');
    expect(tokens).toMatch(/--accent\s*:/);
    expect(tokens).toMatch(/\[data-theme="dark"\]/);
  });

  it('keeps style.css as the canonical stylesheet', () => {
    const style = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
    expect(style).toMatch(/css\/tokens\.css/);
    expect(style.length).toBeGreaterThan(1000);
  });

  it('turns global.css and bundle.css into thin shims', () => {
    const globalCss = fs.readFileSync(path.join(root, 'global.css'), 'utf8');
    const bundleCss = fs.readFileSync(path.join(root, 'bundle.css'), 'utf8');
    expect(globalCss).toMatch(/@import url\("style\.css"\)/);
    expect(bundleCss).toMatch(/@import url\("style\.css"\)/);
    expect(globalCss.length).toBeLessThan(800);
    expect(bundleCss.length).toBeLessThan(800);
  });

  it('home page no longer double-loads global.css with style.css', () => {
    const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    expect(index).toMatch(/style\.css/);
    expect(index).not.toMatch(/href="global\.css"/);
  });
});
