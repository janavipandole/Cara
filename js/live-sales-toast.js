// live-sales-toast.js
// Dynamically renders social proof live sales notifications toasts periodically.

(function () {
  'use strict';

  const BUYERS = [
    'Amit',
    'Priya',
    'Ramesh',
    'Sneha',
    'Rahul',
    'Ananya',
    'Arjun',
    'Kavya',
    'Vivek',
    'Meera',
    'Aditya',
    'Neha',
    'Siddharth',
    'Riya',
    'Karan',
  ];

  const CITIES = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Pune',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Chandigarh',
    'Kochi',
  ];

  const TIMES = [
    '1 minute ago',
    '2 minutes ago',
    '3 minutes ago',
    '5 minutes ago',
    '10 minutes ago',
    'just now',
  ];

  const POPUP_INTERVAL = 25000; // 25 seconds
  let dismissTimer = null;

  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getProducts() {
    return window.products || [];
  }

  function createContainer() {
    let container = document.getElementById('live-sales-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'live-sales-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showLiveToast() {
    const products = getProducts();
    if (products.length === 0) return;

    const container = createContainer();
    const product = getRandomElement(products);
    const buyer = getRandomElement(BUYERS);
    const city = getRandomElement(CITIES);
    const time = getRandomElement(TIMES);

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'live-sales-toast';
    toast.innerHTML = `
      <button class="live-sales-close" aria-label="Dismiss">&times;</button>
      <div class="live-sales-img-wrapper">
        <img src="${_escape(product.img)}" alt="${_escape(product.name)}">
      </div>
      <div class="live-sales-details">
        <p class="live-sales-title">Recent Purchase</p>
        <p class="live-sales-message">
          <span class="buyer">${_escape(buyer)}</span> from ${_escape(city)} bought a
          <span class="product">${_escape(product.name)}</span>
        </p>
        <span class="live-sales-time">${_escape(time)}</span>
      </div>
    `;

    container.innerHTML = '';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    container.appendChild(toast);

    // Slide-in after a tick
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Close button click listener
    toast.querySelector('.live-sales-close').addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast(toast);
    });

    // Hover pause logic
    let isHovered = false;
    let timeRemaining = DISPLAY_DURATION;
    let startTime = Date.now();

    function startDismissTimer() {
      dismissTimer = setTimeout(() => {
        if (!isHovered) {
          dismissToast(toast);
        }
      }, timeRemaining);
    }

    toast.addEventListener('mouseenter', () => {
      isHovered = true;
      clearTimeout(dismissTimer);
      timeRemaining -= Date.now() - startTime;
    });

    toast.addEventListener('mouseleave', () => {
      isHovered = false;
      startTime = Date.now();
      startDismissTimer();
    });

    startDismissTimer();
  }

  function dismissToast(toast) {
    clearTimeout(dismissTimer);
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }

  function startToastCycle() {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let cycleTimer = null;
    let initialTimer = null;

    const clearCycle = () => {
      if (initialTimer !== null) {
        clearTimeout(initialTimer);
        initialTimer = null;
      }
      if (cycleTimer !== null) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
    };

    const beginCycle = () => {
      if (cycleTimer !== null) return;
      initialTimer = setTimeout(() => {
        showLiveToast();
        cycleTimer = setInterval(showLiveToast, POPUP_INTERVAL);
      }, 6000);
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearCycle();
      } else {
        beginCycle();
      }
    });

    if (typeof window.addEventListener === 'function') {
      window.addEventListener('pagehide', clearCycle);
    }
    beginCycle();
  }

  // Auto-init on DOMContentLoaded. The immediate idempotent call covers
  // deferred scripts that load after DOMContentLoaded has already fired.
  document.addEventListener('DOMContentLoaded', startToastCycle);
  startToastCycle();
})();

export function getSalesToastDisplayDuration() { return 6000; }