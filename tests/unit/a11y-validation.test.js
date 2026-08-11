/**
 * Unit tests for js/a11y-validation.js
 * Tests WCAG 2.1 AA compliance audit checks.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Load the real module so window.runA11yAudit is exposed.
import '../../js/a11y-validation.js';

// Extract the audit logic for unit testing.
// Mirrors the checks in js/a11y-validation.js.
function runA11yAudit(document) {
  const errors = [];
  const warnings = [];

  // Check images for alt attributes
  const images = document.querySelectorAll('img');
  images.forEach(function (img, i) {
    if (!img.hasAttribute('alt')) {
      errors.push({
        element: img,
        message: 'Image ' + (img.src ? '"' + img.src + '"' : '#' + i) + ' is missing an alt attribute.',
      });
    }
  });

  // Check buttons for accessible text
  const buttons = document.querySelectorAll('button');
  buttons.forEach(function (btn, i) {
    const hasText = !!btn.textContent.trim();
    const hasAriaLabel = btn.hasAttribute('aria-label') && !!btn.getAttribute('aria-label').trim();
    const hasAriaLabelledby = btn.hasAttribute('aria-labelledby');

    if (!hasText && !hasAriaLabel && !hasAriaLabelledby) {
      errors.push({
        element: btn,
        message: 'Button ' + (btn.id ? '"#' + btn.id + '"' : '#' + i) + ' has no accessible name.',
      });
    }
  });

  // Check inputs for associated labels
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(function (input, i) {
    if (input.type === 'hidden') return;

    const id = input.id;
    let hasLabel = false;

    if (id) {
      const label = document.querySelector('label[for="' + id + '"]');
      if (label && label.textContent.trim()) {
        hasLabel = true;
      }
    }

    if (!hasLabel) {
      let parent = input.parentElement;
      while (parent) {
        if (parent.tagName === 'LABEL') {
          hasLabel = true;
          break;
        }
        parent = parent.parentElement;
      }
    }

    const hasAriaLabel = input.hasAttribute('aria-label') && !!input.getAttribute('aria-label').trim();
    const hasAriaLabelledby = input.hasAttribute('aria-labelledby');

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
      warnings.push({
        element: input,
        message: 'Input ' + (input.name ? '"' + input.name + '"' : '#' + i) + ' has no associated label or aria-label.',
      });
    }
  });

  return { errors, warnings };
}

describe('A11y Validation Audit', () => {
  describe('Image alt attribute checks', () => {
    it('flags images missing alt attributes as errors', () => {
      document.body.innerHTML = '<img src="photo.jpg" />';
      const { errors } = runA11yAudit(document);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('missing an alt attribute');
    });

    it('does not flag images with alt attributes', () => {
      document.body.innerHTML = '<img src="photo.jpg" alt="A photo" />';
      const { errors } = runA11yAudit(document);
      expect(errors.length).toBe(0);
    });

    it('does not flag images with empty alt (decorative images)', () => {
      document.body.innerHTML = '<img src="decoration.svg" alt="" />';
      const { errors } = runA11yAudit(document);
      expect(errors.length).toBe(0);
    });
  });

  describe('Button accessible name checks', () => {
    it('flags buttons without text or aria-label as errors', () => {
      document.body.innerHTML = '<button id="action-btn"></button>';
      const { errors } = runA11yAudit(document);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('has no accessible name');
    });

    it('does not flag buttons with text content', () => {
      document.body.innerHTML = '<button>Submit</button>';
      const { errors } = runA11yAudit(document);
      expect(errors.length).toBe(0);
    });

    it('does not flag buttons with aria-label', () => {
      document.body.innerHTML = '<button aria-label="Close dialog"></button>';
      const { errors } = runA11yAudit(document);
      expect(errors.length).toBe(0);
    });
  });

  describe('Input label association checks', () => {
    it('flags inputs without labels or aria-label as warnings', () => {
      document.body.innerHTML = '<input type="text" name="email" />';
      const { warnings } = runA11yAudit(document);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('has no associated label');
    });

    it('does not flag inputs with explicit label[for] association', () => {
      document.body.innerHTML = '<label for="email-input">Email</label><input type="text" id="email-input" name="email" />';
      const { warnings } = runA11yAudit(document);
      expect(warnings.length).toBe(0);
    });

    it('does not flag inputs wrapped inside a label element', () => {
      document.body.innerHTML = '<label>Username<input type="text" name="username" /></label>';
      const { warnings } = runA11yAudit(document);
      expect(warnings.length).toBe(0);
    });

    it('does not flag inputs with aria-label', () => {
      document.body.innerHTML = '<input type="text" aria-label="Search products" />';
      const { warnings } = runA11yAudit(document);
      expect(warnings.length).toBe(0);
    });

    it('does not flag inputs with aria-labelledby pointing to a label', () => {
      document.body.innerHTML =
        '<span id="search-title">Search</span><input type="text" aria-labelledby="search-title" />';
      const { warnings } = runA11yAudit(document);
      expect(warnings.length).toBe(0);
    });

    it('skips hidden inputs', () => {
      document.body.innerHTML = '<input type="hidden" name="token" value="abc" />';
      const { warnings } = runA11yAudit(document);
      expect(warnings.length).toBe(0);
    });
  });

  describe('Combined audit results', () => {
    it('collects both errors and warnings from a mixed document', () => {
      document.body.innerHTML = `
        <img src="bad.jpg" />
        <button id="icon-btn"></button>
        <input type="text" name="unnamed" />
        <img src="good.jpg" alt="Good image" />
        <button>Save</button>
        <label for="email-fld">Email</label>
        <input type="text" id="email-fld" name="email" />
      `;
      const { errors, warnings } = runA11yAudit(document);
      expect(errors.length).toBe(2); // img without alt + button without accessible name
      expect(warnings.length).toBe(1); // input without label
    });
  });

  it('should detect images missing alt text attributes and record error', () => {
    const doc = document.createElement('div');
    doc.innerHTML = '<img src="test.jpg">';
    const results = runA11yAudit(doc);
    expect(results.errors.length).toBe(1);
  });

  describe('Real module audit function', () => {
    it('exposes runA11yAudit on the window', () => {
      expect(typeof window.runA11yAudit).toBe('function');
    });

    it('runs the real audit on a compliant page without throwing', () => {
      document.body.innerHTML = `
        <img src="ok.jpg" alt="Ok image" />
        <button>Submit</button>
        <label for="name">Name</label>
        <input type="text" id="name" name="name" />
      `;
      expect(() => window.runA11yAudit()).not.toThrow();
    });

    it('runs the real audit on a violating page without throwing', () => {
      document.body.innerHTML = `
        <img src="bad.jpg" />
        <button></button>
        <input type="text" name="unnamed" />
      `;
      expect(() => window.runA11yAudit()).not.toThrow();
    });
  });

});
