import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import '../../js/testimonials-carousel.js';

describe('testimonials-carousel.js unit tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div class="testimonials-carousel-wrapper">
        <div id="testimonials-track"></div>
        <div id="testimonials-dots"></div>
        <button id="testimonial-prev"></button>
        <button id="testimonial-next"></button>
      </div>
    `;
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    vi.advanceTimersByTime(200);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders slides when testimonials track is present', () => {
    const track = document.getElementById('testimonials-track');
    expect(track).not.toBeNull();
    expect(track.children.length).toBeGreaterThan(0);
  });

  it('renders dots when testimonials-dots is present', () => {
    const dots = document.getElementById('testimonials-dots');
    expect(dots).not.toBeNull();
    expect(dots.children.length).toBeGreaterThan(0);
  });

  it('does nothing when testimonials-track is missing', () => {
    document.body.innerHTML = '<div id="testimonials-dots"></div>';
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    // Should not throw
  });

  it('does nothing when testimonials-dots is missing', () => {
    document.body.innerHTML = '<div id="testimonials-track"></div>';
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    // Should not throw
  });

  it('handles next button click without throwing', () => {
    const nextBtn = document.getElementById('testimonial-next');
    nextBtn.click();
    // Should not throw
  });

  it('handles prev button click without throwing', () => {
    const prevBtn = document.getElementById('testimonial-prev');
    prevBtn.click();
    // Should not throw
  });
});
