import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('WCAG 2.1 AA Accessibility Tests', () => {
  const pages = ['index.html', 'contact.html', 'shop.html', 'cart.html', 'about.html'];

  pages.forEach(page => {
    describe(`Accessibility checks for ${page}`, () => {
      let html;

      beforeEach(() => {
        const filePath = path.resolve(process.cwd(), page);
        html = fs.readFileSync(filePath, 'utf8');
      });

      it('should contain a skip to main content link', () => {
        expect(html).toContain('class="skip-link"');
        expect(html).toContain('href="#main-content"');
      });

      it('should contain a main landmark container with id="main-content"', () => {
        expect(html).toContain('id="main-content"');
      });

      it('should ensure cart icon has accessible label', () => {
        expect(html).toMatch(/aria-label=["'](Shopping cart|Cart)["']/i);
      });
    });
  });

  describe('Contact page form accessibility', () => {
    let contactHtml;

    beforeEach(() => {
      const filePath = path.resolve(process.cwd(), 'contact.html');
      contactHtml = fs.readFileSync(filePath, 'utf8');
    });

    it('should have labels associated with form inputs', () => {
      expect(contactHtml).toContain('<label for="name">');
      expect(contactHtml).toContain('<label for="email">');
      expect(contactHtml).toContain('<label for="message">');
    });
  });
});
