import { describe, it, expect } from 'vitest';

describe('contact-autosave', () => {
  it('should export safeSaveContactForm', async () => {
    const mod = await import('../../js/contact-autosave.js');
    expect(typeof mod.safeSaveContactForm).toBe('function');
  });

  it('should return false for null/undefined data', async () => {
    const mod = await import('../../js/contact-autosave.js');
    expect(mod.safeSaveContactForm(null)).toBe(false);
    expect(mod.safeSaveContactForm(undefined)).toBe(false);
  });

  it('should return false for empty object', async () => {
    const mod = await import('../../js/contact-autosave.js');
    expect(mod.safeSaveContactForm({})).toBe(false);
  });

  it('should return true for object with at least one field', async () => {
    const mod = await import('../../js/contact-autosave.js');
    expect(mod.safeSaveContactForm({ name: 'Test' })).toBe(true);
    expect(mod.safeSaveContactForm({ email: 'test@test.com' })).toBe(true);
    expect(mod.safeSaveContactForm({ message: 'Hello' })).toBe(true);
  });
});
