(function () {
  'use strict';
  const nav = document.querySelector('nav[aria-label="breadcrumb"]');
  if (!nav) return;
  const items = Array.from(nav.querySelectorAll('a')).map((a) => ({
    name: a.textContent.trim(),
    item: a.href,
  }));
  if (!items.length) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  });
  document.head.appendChild(script);
})();
