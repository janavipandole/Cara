/**
 * Breadcrumbs Generator Engine
 * Generates route breadcrumbs, accessible HTML navigation markup, and Schema.org JSON-LD structured data.
 */
export class BreadcrumbsGenerator {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl !== undefined ? options.baseUrl : 'https://cara.example.com';
    this.customLabels = options.customLabels || {
      'shop': 'All Collections',
      'cart': 'Shopping Cart',
      'checkout': 'Secure Checkout',
      'account': 'My Account',
      'products': 'Products'
    };
  }

  formatLabel(segment) {
    const key = segment.toLowerCase();
    if (this.customLabels[key]) return this.customLabels[key];
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  generateFromPath(pathname = '/') {
    const cleanPath = pathname.split('?')[0].split('#')[0];
    const segments = cleanPath.split('/').filter(Boolean);
    
    const crumbs = [
      { name: 'Home', url: `${this.baseUrl}/` }
    ];

    let currentPath = '';
    segments.forEach((seg, index) => {
      currentPath += `/${seg}`;
      crumbs.push({
        name: this.formatLabel(seg),
        url: `${this.baseUrl}${currentPath}`,
        isCurrent: index === segments.length - 1
      });
    });

    return crumbs;
  }

  renderHTML(crumbs = []) {
    if (!crumbs || crumbs.length === 0) return '';

    const itemsHTML = crumbs.map((crumb, idx) => {
      const isLast = idx === crumbs.length - 1;
      if (isLast) {
        return `<li class="breadcrumb-item active" aria-current="page">${crumb.name}</li>`;
      }
      return `<li class="breadcrumb-item"><a href="${crumb.url}">${crumb.name}</a></li>`;
    }).join('');

    return `<nav aria-label="Breadcrumb" class="cara-breadcrumbs"><ol class="breadcrumb">${itemsHTML}</ol></nav>`;
  }

  generateJSONLD(crumbs = []) {
    if (!crumbs || crumbs.length === 0) return '';

    const itemListElement = crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }));

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement
    });
  }
}


export function getBreadcrumbsGeneratorStatusHelper12() {
  return { status: "ok", fn: "getBreadcrumbsGeneratorStatusHelper12" };
}
