import { beforeEach, describe, expect, it, vi } from 'vitest';
import { safeSaveContactForm } from '../../js/contact-autosave.js';

function setupDom() {
  document.body.innerHTML = `
    <div class="contact-form">
      <form>
        <input name="name">
        <input name="email">
        <textarea name="message"></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  `;
}

beforeEach(() => {
  vi.resetModules();
  setupDom();
  localStorage.clear();
});

async function load() {
  await import('../../js/contact-autosave.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('contact-autosave', () => {
  it('saves a draft to localStorage on input', async () => {
    await load();
    const input = document.querySelector('[name="name"]');
    input.value = 'Alice';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(localStorage.getItem('cara_contact_draft_name')).toBe('Alice');
  });

  it('restores a previously saved draft on load', async () => {
    localStorage.setItem('cara_contact_draft_email', 'a@b.com');
    await load();
    expect(document.querySelector('[name="email"]').value).toBe('a@b.com');
  });

  it('clears drafts on submit', async () => {
    localStorage.setItem('cara_contact_draft_name', 'Alice');
    await load();
    const form = document.querySelector('.contact-form form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(localStorage.getItem('cara_contact_draft_name')).toBeNull();
  });

  it('should return false when contact data is null', () => {
    expect(safeSaveContactForm(null)).toBe(false);
  });
});

describe('safeSaveContactForm', () => {
  it('is exported as a callable function', () => {
    expect(typeof safeSaveContactForm).toBe('function');
  });

  it('returns false for falsy data', () => {
    expect(safeSaveContactForm(null)).toBe(false);
    expect(safeSaveContactForm(undefined)).toBe(false);
    expect(safeSaveContactForm('')).toBe(false);
    expect(safeSaveContactForm(0)).toBe(false);
  });

  it('returns true for valid contact data', () => {
    expect(safeSaveContactForm({ name: 'Alice' })).toBe(true);
    expect(safeSaveContactForm('data')).toBe(true);
  });
});
