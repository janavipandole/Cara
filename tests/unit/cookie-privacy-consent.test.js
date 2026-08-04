import { describe, it, expect, beforeEach } from 'vitest';
import { CookiePrivacyConsent } from '../../js/cookie-privacy-consent.js';

describe('CookiePrivacyConsent', () => {
  let manager;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    manager = new CookiePrivacyConsent();
  });

  it('should return default unconfirmed consent state', () => {
    expect(manager.hasUserDecided()).toBe(false);
    expect(manager.consentState.necessary).toBe(true);
    expect(manager.consentState.analytics).toBe(false);
  });

  it('should accept all cookies and persist preference', () => {
    const consent = manager.acceptAll();
    expect(consent.decisionMade).toBe(true);
    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(true);
    expect(manager.hasUserDecided()).toBe(true);
  });

  it('should reject non-essential cookies and set flags', () => {
    const consent = manager.rejectOptional();
    expect(consent.decisionMade).toBe(true);
    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
  });

  it('should render consent banner DOM element if decision is pending', () => {
    const banner = manager.renderConsentBanner();
    expect(banner).not.toBeNull();
    expect(document.querySelector('.cookie-privacy-banner')).not.toBeNull();
  });
});
