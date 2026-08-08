import { describe, it, expect } from 'vitest';
import { BreadcrumbsGenerator } from '../../js/breadcrumbs-generator.js';

describe('BreadcrumbsGenerator', () => {
  it('generates breadcrumb trail from URL path with custom route labels', () => {
    const generator = new BreadcrumbsGenerator({
      baseUrl: 'https://cara.com',
      customLabels: { 'shop': 'Shop Store' }
    });

    const crumbs = generator.generateFromPath('/shop/dresses/summer-floral');
    expect(crumbs).toHaveLength(4);
    expect(crumbs[0].name).toBe('Home');
    expect(crumbs[1].name).toBe('Shop Store');
    expect(crumbs[2].name).toBe('Dresses');
    expect(crumbs[3].name).toBe('Summer Floral');
    expect(crumbs[3].isCurrent).toBe(true);
  });

  it('renders accessible HTML markup with ARIA attributes', () => {
    const generator = new BreadcrumbsGenerator();
    const crumbs = generator.generateFromPath('/cart');
    const html = generator.renderHTML(crumbs);

    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Shopping Cart');
  });

  it('generates valid Schema.org JSON-LD BreadcrumbList script', () => {
    const generator = new BreadcrumbsGenerator({ baseUrl: 'https://cara.com' });
    const crumbs = generator.generateFromPath('/shop/shoes');
    const jsonStr = generator.generateJSONLD(crumbs);
    const parsed = JSON.parse(jsonStr);

    expect(parsed['@type']).toBe('BreadcrumbList');
    expect(parsed.itemListElement).toHaveLength(3);
    expect(parsed.itemListElement[2].name).toBe('Shoes');
  });
});
