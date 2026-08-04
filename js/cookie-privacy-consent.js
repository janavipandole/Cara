/**
 * GDPR / CCPA Cookie & Privacy Consent Management Engine
 * Manages user cookie preferences, consent persistence, and banner UI state.
 */

export class CookiePrivacyConsent {
  constructor(storageKey = 'cara_privacy_consent_v1') {
    this.storageKey = storageKey;
    this.defaultConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: null,
      decisionMade: false
    };
    this.consentState = this.loadConsent();
  }

  loadConsent() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : { ...this.defaultConsent };
    } catch {
      return { ...this.defaultConsent };
    }
  }

  saveConsent(preferences = {}) {
    this.consentState = {
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      timestamp: Date.now(),
      decisionMade: true
    };
    localStorage.setItem(this.storageKey, JSON.stringify(this.consentState));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cara:privacy-consent-updated', { detail: this.consentState }));
    }
    return this.consentState;
  }

  acceptAll() {
    return this.saveConsent({ analytics: true, marketing: true });
  }

  rejectOptional() {
    return this.saveConsent({ analytics: false, marketing: false });
  }

  hasUserDecided() {
    return this.consentState.decisionMade;
  }

  renderConsentBanner(containerId = 'cookie-consent-banner') {
    if (typeof document === 'undefined' || this.hasUserDecided()) return null;

    let banner = document.getElementById(containerId);
    if (!banner) {
      banner = document.createElement('div');
      banner.id = containerId;
      banner.className = 'cookie-privacy-banner';
      document.body.appendChild(banner);
    }

    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <p class="cookie-text">
          🍪 We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic.
          <a href="privacy.html">Privacy Policy</a>
        </p>
        <div class="cookie-btn-group">
          <button id="cookie-accept-all" class="btn-accept">Accept All</button>
          <button id="cookie-reject-optional" class="btn-reject">Reject Non-Essential</button>
        </div>
      </div>
    `;

    document.getElementById('cookie-accept-all')?.addEventListener('click', () => {
      this.acceptAll();
      banner.remove();
    });

    document.getElementById('cookie-reject-optional')?.addEventListener('click', () => {
      this.rejectOptional();
      banner.remove();
    });

    return banner;
  }
}
