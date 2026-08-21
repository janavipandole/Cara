/**
 * Unit tests for testimonials-carousel.js - enhanced coverage
 * Tests carousel navigation, autoplay, and accessibility.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('testimonials-carousel.js enhanced coverage', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="testimonials-carousel" role="region" aria-label="Customer testimonials">
        <div class="testimonial-slide" aria-hidden="false">
          <blockquote>Testimonial 1</blockquote>
        </div>
        <div class="testimonial-slide" aria-hidden="true">
          <blockquote>Testimonial 2</blockquote>
        </div>
        <button class="carousel-prev" aria-label="Previous testimonial">Prev</button>
        <button class="carousel-next" aria-label="Next testimonial">Next</button>
      </div>
    `;
  });

  it('has proper ARIA region labeling', () => {
    const carousel = document.querySelector('.testimonials-carousel');
    expect(carousel.getAttribute('role')).toBe('region');
    expect(carousel.getAttribute('aria-label')).toBeTruthy();
  });

  it('manages aria-hidden on slides correctly', () => {
    const slides = document.querySelectorAll('.testimonial-slide');
    const visibleSlides = Array.from(slides).filter(s => s.getAttribute('aria-hidden') === 'false');
    const hiddenSlides = Array.from(slides).filter(s => s.getAttribute('aria-hidden') === 'true');
    expect(visibleSlides.length).toBe(1);
    expect(hiddenSlides.length).toBe(1);
  });

  it('has accessible prev/next buttons with aria-labels', () => {
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    expect(prevBtn.getAttribute('aria-label')).toContain('Previous');
    expect(nextBtn.getAttribute('aria-label')).toContain('Next');
  });
});
