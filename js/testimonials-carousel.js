/**
 * testimonials-carousel.js
 * Implements a fully responsive, touch-friendly customer testimonials slider.
 */

document.addEventListener('DOMContentLoaded', () => {
  const TESTIMONIALS = [
    {
      name: 'Sarah Jenkins',
      role: 'Loyal Shopper since 2024',
      rating: 5,
      review:
        'Cara has completely redefined my wardrobe. The fabrics are premium, delivery is always on time, and the customer support is exceptional!',
      avatar: 'images/about/avatar1.png',
    },
    {
      name: 'James Kovalsky',
      role: 'Fashion Enthusiast',
      rating: 5,
      review:
        "The smart ordering system is incredibly fast, and their seasonal deals are unbeatable. I've recommended Cara to all my friends!",
      avatar: 'images/about/avatar2.png',
    },
    {
      name: 'Emily Chen',
      role: 'Verified Buyer',
      rating: 5,
      review:
        'The AI Stylist suggestions are spot on! I love how intuitive the site is, especially the dark mode feature which is super clean.',
      avatar: 'images/about/avatar3.png',
    },
    {
      name: 'Marcus Vance',
      role: 'Style Influencer',
      rating: 5,
      review:
        'Absolutely love the fits and designs from Cara. The return process is completely hassle-free, making it the perfect platform for trendsetters.',
      avatar: 'images/about/avatar4.png',
    },
  ];

  const track = document.getElementById('testimonials-track');
  const dotsContainer = document.getElementById('testimonials-dots');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const wrapper = document.querySelector('.testimonials-carousel-wrapper');

  if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

  let currentIdx = 0;
  let autoplayTimer = null;
  let slides = [];
  let visibleCount = 3; // Default for desktop

  // Initialize slides markup
  function initSlides() {
    track.innerHTML = TESTIMONIALS.map((t) => {
      const starsHTML = Array(t.rating)
        .fill('<i class="ri-star-fill"></i>')
        .join('');
      return `
        <div class="testimonial-slide">
          <div class="testimonial-stars" aria-label="${t.rating} out of 5 stars">
            ${starsHTML}
          </div>
          <p class="testimonial-quote">${t.review}</p>
          <div class="testimonial-user">
            <img class="testimonial-avatar" src="${t.avatar}" alt="${t.name}" onerror="this.src='images/people/1.png'">
            <div class="testimonial-details">
              <h4>${t.name}</h4>
              <span>${t.role}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    slides = Array.from(track.children);
  }

  // Determine how many slides are visible at once
  function getVisibleCount() {
    const width = window.innerWidth;
    if (width <= 650) return 1;
    if (width <= 991) return 2;
    return 3;
  }

  // Create pagination dots
  function renderDots() {
    dotsContainer.innerHTML = '';
    visibleCount = getVisibleCount();
    const dotsCount = Math.max(1, TESTIMONIALS.length - visibleCount + 1);

    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === currentIdx ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide page ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Update slide position
  function updateCarousel() {
    visibleCount = getVisibleCount();
    const maxIdx = Math.max(0, TESTIMONIALS.length - visibleCount);

    // Safety check for indices
    if (currentIdx > maxIdx) {
      currentIdx = maxIdx;
    }

    if (slides.length === 0) return;

    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 30; // Matches gap in CSS
    const shift = currentIdx * (slideWidth + gap);

    track.style.transform = `translateX(-${shift}px)`;

    // Update dots active class
    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIdx);
    });
  }

  // Navigate to specific slide index
  function goToSlide(index) {
    visibleCount = getVisibleCount();
    const maxIdx = Math.max(0, TESTIMONIALS.length - visibleCount);

    if (index < 0) {
      currentIdx = maxIdx; // wrap to end
    } else if (index > maxIdx) {
      currentIdx = 0; // wrap to start
    } else {
      currentIdx = index;
    }
    updateCarousel();
  }

  // Autoplay functionality
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentIdx + 1);
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Navigation Click handlers
  prevBtn.addEventListener('click', () => {
    goToSlide(currentIdx - 1);
    resetAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIdx + 1);
    resetAutoplay();
  });

  // Autoplay pause on hover
  wrapper.addEventListener('mouseenter', stopAutoplay);
  wrapper.addEventListener('mouseleave', startAutoplay);

  // Resize handler
  window.addEventListener('resize', () => {
    const oldVisible = visibleCount;
    visibleCount = getVisibleCount();
    if (oldVisible !== visibleCount) {
      renderDots();
      goToSlide(Math.min(currentIdx, TESTIMONIALS.length - visibleCount));
    } else {
      updateCarousel();
    }
  });

  // Touch Swipe Support
  let startX = 0;
  let isDragging = false;

  track.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      stopAutoplay();
    },
    { passive: true },
  );

  track.addEventListener(
    'touchmove',
    (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diffX = startX - currentX;

      if (Math.abs(diffX) > 10) {
        // Prevent page scroll when swiping horizontally
        if (e.cancelable) e.preventDefault();
      }
    },
    { passive: false },
  );

  track.addEventListener(
    'touchend',
    (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (diffX > 50) {
        goToSlide(currentIdx + 1); // Swipe left -> Next
      } else if (diffX < -50) {
        goToSlide(currentIdx - 1); // Swipe right -> Prev
      }
      startAutoplay();
    },
    { passive: true },
  );

  // Init execution
  initSlides();
  renderDots();
  setTimeout(() => {
    updateCarousel();
    startAutoplay();
  }, 100);
});
