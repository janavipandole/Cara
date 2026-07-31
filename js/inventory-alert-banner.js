// Real-Time Inventory Alert Banner UI Module

export function renderInventoryBanner(containerId, message, type = 'warning') {
  if (typeof document === 'undefined') return null;
  const container = document.getElementById(containerId);
  if (!container) return null;

  const banner = document.createElement('div');
  banner.className = `inventory-banner inventory-banner-${type}`;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = `
    <div class="inventory-banner-content">
      <span class="inventory-banner-icon">${type === 'warning' ? '⚠️' : 'ℹ️'}</span>
      <span class="inventory-banner-text">${message}</span>
    </div>
    <button class="inventory-banner-close" aria-label="Dismiss banner">&times;</button>
  `;

  const closeBtn = banner.querySelector('.inventory-banner-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => banner.remove());
  }

  container.appendChild(banner);
  return banner;
}
