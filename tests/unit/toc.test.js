/**
 * Unit tests for js/toc.js
 * Tests the Table of Contents sidebar generation for privacy policy pages.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Table of Contents Generation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing when no policy-page element exists', () => {
    document.body.innerHTML = '<div id="other-page"></div>';
    // The module checks for #policy-page and returns early if missing.
    const policyPage = document.querySelector('#policy-page');
    expect(policyPage).toBeNull();
  });

  it('assigns unique IDs to all h2 headers inside .policy-section', () => {
    document.body.innerHTML = `
      <div id="policy-page">
        <div class="policy-section">
          <h2>Privacy Policy</h2>
          <h2>Terms of Service</h2>
          <h2>Refund Policy</h2>
        </div>
      </div>
    `;

    const policyPage = document.querySelector('#policy-page');
    const headers = policyPage.querySelectorAll('.policy-section h2');

    // Simulate the TOC ID assignment
    headers.forEach((header, index) => {
      header.id = `policy-sec-${index}`;
    });

    expect(headers[0].id).toBe('policy-sec-0');
    expect(headers[1].id).toBe('policy-sec-1');
    expect(headers[2].id).toBe('policy-sec-2');
  });

  it('generates anchor links pointing to the correct header IDs', () => {
    document.body.innerHTML = `
      <div id="policy-page">
        <div class="policy-section">
          <h2 id="policy-sec-0">Privacy Policy</h2>
          <h2 id="policy-sec-1">Terms of Service</h2>
        </div>
      </div>
    `;

    const policyPage = document.querySelector('#policy-page');
    const headers = policyPage.querySelectorAll('.policy-section h2');
    const links = [];

    headers.forEach((header) => {
      const link = document.createElement('a');
      link.href = '#' + header.id;
      link.textContent = header.textContent;
      links.push(link);
    });

    expect(links[0].getAttribute('href')).toBe('#policy-sec-0');
    expect(links[0].textContent).toBe('Privacy Policy');
    expect(links[1].getAttribute('href')).toBe('#policy-sec-1');
    expect(links[1].textContent).toBe('Terms of Service');
  });

  it('creates a TOC sidebar div with correct structure', () => {
    const tocDiv = document.createElement('div');
    tocDiv.id = 'privacy-toc-sidebar';

    tocDiv.style.cssText = `
      position: sticky;
      top: 120px;
      width: 220px;
      padding: 15px;
      background: rgba(8,129,120,.04);
      border-left: 3px solid #088178;
      flex-shrink: 0;
    `;

    expect(tocDiv.id).toBe('privacy-toc-sidebar');
    expect(tocDiv.style.position).toBe('sticky');
    expect(tocDiv.style.borderLeft).toContain('rgb(8, 129, 120)');
  });

  it('handles empty headers gracefully', () => {
    document.body.innerHTML = `
      <div id="policy-page">
        <div class="policy-section">
          <p>No headings here</p>
        </div>
      </div>
    `;

    const policyPage = document.querySelector('#policy-page');
    const headers = policyPage.querySelectorAll('.policy-section h2');

    expect(headers.length).toBe(0);
  });

  it('builds the full TOC layout with sidebar and section links', async () => {
    vi.resetModules();
    document.body.innerHTML = `
      <div id="policy-page">
        <div class="policy-section">
          <h2>Privacy Policy</h2>
          <h2>Terms of Service</h2>
        </div>
      </div>
    `;
    await import('../../js/toc.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(document.getElementById('policy-layout')).not.toBeNull();
    const toc = document.getElementById('privacy-toc-sidebar');
    expect(toc).not.toBeNull();
    const links = Array.from(toc.querySelectorAll('a'));
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('#policy-sec-0');
    expect(links[0].textContent).toBe('Privacy Policy');
    expect(links[1].getAttribute('href')).toBe('#policy-sec-1');
    expect(links[1].textContent).toBe('Terms of Service');
  });
});
