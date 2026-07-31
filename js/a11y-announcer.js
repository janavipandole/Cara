// ARIA Live Region Announcement Manager for Screen Readers

let liveRegionPolite = null;
let liveRegionAssertive = null;

export function initAnnouncer() {
  if (typeof document === 'undefined') return;

  liveRegionPolite = document.getElementById('a11y-announcer-polite');
  if (!liveRegionPolite) {
    liveRegionPolite = document.createElement('div');
    liveRegionPolite.id = 'a11y-announcer-polite';
    liveRegionPolite.className = 'sr-only';
    liveRegionPolite.setAttribute('aria-live', 'polite');
    liveRegionPolite.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegionPolite);
  }

  liveRegionAssertive = document.getElementById('a11y-announcer-assertive');
  if (!liveRegionAssertive) {
    liveRegionAssertive = document.createElement('div');
    liveRegionAssertive.id = 'a11y-announcer-assertive';
    liveRegionAssertive.className = 'sr-only';
    liveRegionAssertive.setAttribute('aria-live', 'assertive');
    liveRegionAssertive.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegionAssertive);
  }
}

export function announce(message, politeness = 'polite') {
  if (typeof document === 'undefined') return;
  initAnnouncer();

  const targetRegion = politeness === 'assertive' ? liveRegionAssertive : liveRegionPolite;
  if (targetRegion) {
    targetRegion.textContent = '';
    setTimeout(() => {
      targetRegion.textContent = message;
    }, 50);
  }
}
