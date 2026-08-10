import { describe, it, expect } from 'vitest';
import { BreadcrumbsGenerator } from '../../js/breadcrumbs-generator.js';

describe('BreadcrumbsGenerator', () => {
  const gen = new BreadcrumbsGenerator();

  it('generates home crumb plus segment crumbs', () => {
    const crumbs = gen.generateBreadcrumbs('/shop/winter-collection.html');
    expect(crumbs.length).toBe(3);
    expect(crumbs[0].label).toBe('Home');
    expect(crumbs[1].label).toBe('Shop');
    expect(crumbs[2].label).toBe('Winter collection');
  });

  it('returns only the home crumb for an empty path', () => {
    const crumbs = gen.generateBreadcrumbs('');
    expect(crumbs.length).toBe(1);
    expect(crumbs[0].label).toBe('Home');
    expect(crumbs[0].url).toBe('index.html');
  });

  it('marks the last crumb as the current page (no url)', () => {
    const crumbs = gen.generateBreadcrumbs('/shop/tshirts.html');
    expect(crumbs[crumbs.length - 1].url).toBeNull();
    expect(crumbs[crumbs.length - 2].url).toBe('/shop');
  });

  it('builds intermediate urls from accumulated segments', () => {
    const crumbs = gen.generateBreadcrumbs('/men/formal/shirts.html');
    expect(crumbs[1].url).toBe('/men');
    expect(crumbs[2].url).toBe('/men/formal');
    expect(crumbs[3].url).toBeNull();
  });

  it('formats segment labels with dashes, underscores, and .html stripped', () => {
    expect(gen.formatLabel('new-arrivals.html')).toBe('New arrivals');
    expect(gen.formatLabel('best_sellers')).toBe('Best sellers');
  });

  it('handles a trailing slash on the path', () => {
    const crumbs = gen.generateBreadcrumbs('/shop/tshirts/');
    expect(crumbs.length).toBe(3);
    expect(crumbs[2].label).toBe('Tshirts');
  });

  it('returns only the home crumb for a root slash', () => {
    const crumbs = gen.generateBreadcrumbs('/');
    expect(crumbs.length).toBe(1);
    expect(crumbs[0].label).toBe('Home');
  });

  it('handles a deeply nested path with four segments', () => {
    const crumbs = gen.generateBreadcrumbs('/men/formal/classic/shirts.html');
    expect(crumbs.length).toBe(5);
    expect(crumbs[1].url).toBe('/men');
    expect(crumbs[2].url).toBe('/men/formal');
    expect(crumbs[3].url).toBe('/men/formal/classic');
    expect(crumbs[4].url).toBeNull();
  });
});
