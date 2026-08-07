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
});
