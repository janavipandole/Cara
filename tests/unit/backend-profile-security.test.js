import { describe, it, expect } from 'vitest';
import { BackendProfileSecurity } from '../../js/backend-profile-security.js';

describe('js/backend-profile-security.js BackendProfileSecurity tests', () => {
  const security = new BackendProfileSecurity();

  it('should sanitize input HTML tags and quotes', () => {
    expect(security.sanitizeField('<script>alert(1)</script>'))
      .toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
    expect(security.sanitizeField('Jane "Doe"'))
      .toBe('Jane &quot;Doe&quot;');
  });

  it('should validate emails correctly', () => {
    expect(security.validateEmail('user@domain.com')).toBe(true);
    expect(security.validateEmail('invalid-email')).toBe(false);
  });

  it('should validate phone numbers correctly', () => {
    expect(security.validatePhone('1234567890')).toBe(true);
    expect(security.validatePhone('+1-234-567-8901')).toBe(true);
    expect(security.validatePhone('abc12345')).toBe(false);
  });
});
