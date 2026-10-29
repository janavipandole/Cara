/**
 * Unit tests for faq.js
 * Tests the FAQ accordion toggle behavior.
 */
import { beforeEach, describe, expect, it } from 'vitest';

import '../../faq.js';

beforeEach(() => {
  document.body.innerHTML = `
    <button class="faq-accordion-btn"><i class="ri-add-line"></i></button>
    <div class="faq-answer" style="display:none"></div>
  `;
  // The module attaches handlers on DOMContentLoaded; dispatch once per
  // fresh DOM so each button gets a single listener.
  document.dispatchEvent(new Event('DOMContentLoaded'));
});

describe('faq.js accordion', () => {
  it('opens a closed answer on click', () => {
    const btn = document.querySelector('.faq-accordion-btn');
    const answer = document.querySelector('.faq-answer');
    expect(answer.style.display).toBe('none');

    btn.click();
    expect(answer.style.display).toBe('block');
    expect(btn.querySelector('i').className).toBe('ri-subtract-line');
  });

  it('closes an open answer on second click', () => {
    const btn = document.querySelector('.faq-accordion-btn');
    const answer = document.querySelector('.faq-answer');

    btn.click();
    expect(answer.style.display).toBe('block');

    btn.click();
    expect(answer.style.display).toBe('none');
    expect(btn.querySelector('i').className).toBe('ri-add-line');
  });

  it('handles multiple toggle cycles without errors', () => {
    const btn = document.querySelector('.faq-accordion-btn');
    const answer = document.querySelector('.faq-answer');

    for (let i = 0; i < 4; i++) {
      btn.click();
      expect(answer.style.display === 'block' || answer.style.display === 'none').toBe(true);
    }
  });

  it('does nothing when no accordion buttons exist', () => {
    document.body.innerHTML = '<div id="no-faq"></div>';
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(document.querySelector('.faq-accordion-btn')).toBeNull();
  });
});
