# GDPR / CCPA Cookie Privacy Compliance Specification

## Overview
The `CookiePrivacyConsent` module ensures compliance with European Union GDPR and California CCPA regulations by offering transparent cookie category controls (Essential, Analytics, Marketing) and enforcing explicit consent before loading tracking technologies.

## Consent Workflow
1. **Initial Visit:** If no decision record exists in LocalStorage, `renderConsentBanner()` mounts a fixed floating footer banner.
2. **Accept All:** Sets `analytics: true` & `marketing: true`, dispatches `cara:privacy-consent-updated` event.
3. **Reject Optional:** Restricts script execution to essential security cookies only.
4. **State Persistence:** Saved with epoch timestamps for audit logging.
