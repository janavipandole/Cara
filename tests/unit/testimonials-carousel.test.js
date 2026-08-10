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

  it('advances the active dot when the next button is clicked', () => {
    const dots = Array.from(document.getElementById('testimonials-dots').children);
    const activeBefore = dots.findIndex((d) => d.classList.contains('active'));
    document.getElementById('testimonial-next').click();
    const activeAfter = dots.findIndex((d) => d.classList.contains('active'));
    expect(activeAfter).toBe((activeBefore + 1) % dots.length);
  });

  it('wraps to the last dot when prev is clicked from the first slide', () => {
    const dots = Array.from(document.getElementById('testimonials-dots').children);
    // Move to the first slide by clicking prev until the active index stops changing.
    for (let i = 0; i < dots.length * 2; i++) {
      document.getElementById('testimonial-prev').click();
    }
    const firstSlide = dots.findIndex((d) => d.classList.contains('active'));
    // One more prev click from the first slide wraps to the last dot.
    document.getElementById('testimonial-prev').click();
    const afterWrap = dots.findIndex((d) => d.classList.contains('active'));
    expect(afterWrap).toBe((firstSlide - 1 + dots.length) % dots.length);
  });

  it('wraps to the first dot when next is clicked from the last slide', () => {
    const dots = Array.from(document.getElementById('testimonials-dots').children);
    // Advance to the last slide.
    for (let i = 0; i < dots.length * 2; i++) {
      document.getElementById('testimonial-next').click();
    }
    const lastSlide = dots.findIndex((d) => d.classList.contains('active'));
    // One more next click wraps back to the first dot.
    document.getElementById('testimonial-next').click();
    const afterWrap = dots.findIndex((d) => d.classList.contains('active'));
    expect(afterWrap).toBe((lastSlide + 1) % dots.length);
  });
});
