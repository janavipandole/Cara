/**
 * Dynamic Breadcrumbs Navigation Generator
 */
export class BreadcrumbsGenerator {
  constructor(options = {}) {
    this.rootLabel = options.rootLabel || 'Home';
    this.rootUrl = options.rootUrl || 'index.html';
  }

  generateBreadcrumbs(currentPath = '') {
    const crumbs = [{ label: this.rootLabel, url: this.rootUrl }];
    const segments = currentPath.split('/').filter(Boolean);

    let accumulatedPath = '';
    segments.forEach((seg, idx) => {
      accumulatedPath += `/${seg}`;
      const label = this.formatLabel(seg);
      crumbs.push({
        label,
        url: idx === segments.length - 1 ? null : accumulatedPath
      });
    });

    return crumbs;
  }

  formatLabel(segment) {
    const clean = segment.replace('.html', '').replace(/[-_]/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
}
