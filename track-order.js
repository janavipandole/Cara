/**
 * track-order.js
 * Handles the Track My Order page functionality for the Cara e-commerce project.
 * Resolves GitHub Issue #302
 */

// ── Dynamic copyright year ────────────────────────────────
const copyrightYearEl = document.getElementById('copyrightYear');
if (copyrightYearEl) {
  copyrightYearEl.textContent = new Date().getFullYear();
}

// ── Mock order database ───────────────────────────────────
// In a real app this would be a backend API call.
// We use a demo entry so reviewers can test the UI immediately.
const MOCK_ORDERS = {
  'CARA-20261234': {
    id: 'CARA-20261234',
    date: 'May 14, 2026',
    carrier: 'FedEx Express',
    trackingNo: '7489 2091 3847',
    estDelivery: 'May 20, 2026',
    status: 'In Transit', // "Processing" | "Packed" | "Shipped" | "In Transit" | "Delivered"
    currentStep: 'transit', // ordered | packed | shipped | transit | delivered
    location: 'Chicago, IL',
    items: [
      {
        name: 'Cartoon Astronaut T-Shirt',
        img: 'images/products/f1.jpg',
        size: 'M',
        qty: 1,
        price: '$78.00',
      },
      {
        name: 'Classic Hoodie',
        img: 'images/products/n2.jpg',
        size: 'L',
        qty: 2,
        price: '$156.00',
      },
    ],
    total: '$234.00',
    timeline: {
      ordered: {
        done: true,
        date: 'May 14, 2026 — 10:32 AM',
        note: 'Your order has been confirmed and is being processed.',
      },
      packed: {
        done: true,
        date: 'May 15, 2026 — 2:14 PM',
        note: 'Your items have been packed and are ready for pickup.',
      },
      shipped: {
        done: true,
        date: 'May 16, 2026 — 9:05 AM',
        note: 'Your package has been handed off to FedEx Express.',
      },
      transit: {
        done: false,
        date: 'May 18, 2026 — 6:45 AM',
        note: 'Your package is on its way — currently in Chicago, IL.',
        active: true,
      },
      delivered: {
        done: false,
        date: 'Expected: May 20, 2026',
        note: 'Your package will be delivered to your door.',
      },
    },
  },
};

// ── DOM references ────────────────────────────────────────
const form = document.getElementById('trackOrderForm');
const trackBtn = document.getElementById('trackBtn');
const btnLoader = document.getElementById('btnLoader');
const formCard = document.querySelector('.track-form-card');
const resultCard = document.getElementById('trackResult');
const errorCard = document.getElementById('trackError');

// ── Module-level timer reference so it can be cleared from any function ──
let progressTimer = null;

// ── Form submit handler ───────────────────────────────────
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const orderIdInput = document.getElementById('orderId');
    const emailInput = document.getElementById('orderEmail');
    const orderIdRaw = orderIdInput.value.trim().toUpperCase();
    const emailRaw = emailInput.value.trim().toLowerCase();

    // Reset previous validation visual states and message tags
    document.querySelectorAll('.track-error-msg').forEach((el) => el.remove());
    orderIdInput.classList.remove('input-error');
    emailInput.classList.remove('input-error');

    function showTrackError(inputElement, msgText) {
      const errorMsg = document.createElement('small');
      errorMsg.className = 'track-error-msg';
      errorMsg.style.cssText =
        'color: #ef4444; display: block; margin-top: 4px; font-weight: 600;';
      errorMsg.textContent = msgText;
      inputElement.classList.add('input-error');
      inputElement.parentNode.insertBefore(errorMsg, inputElement.nextSibling);
    }

    let isTrackValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!orderIdRaw) {
      showTrackError(orderIdInput, 'Order ID is required');
      isTrackValid = false;
    } else if (!/^CARA-\d+$/.test(orderIdRaw)) {
      showTrackError(
        orderIdInput,
        'Invalid Format. Pattern should be CARA-XXXXXXXX (e.g. CARA-20261234)',
      );
      isTrackValid = false;
    }

    if (!emailRaw) {
      showTrackError(emailInput, 'Email is required');
      isTrackValid = false;
    } else if (!emailRegex.test(emailRaw)) {
      showTrackError(emailInput, 'Please enter a valid email address');
      isTrackValid = false;
    }

    if (!isTrackValid) return;

    // Simulate an async API call with a loading state
    setLoading(true);

    setTimeout(function () {
      setLoading(false);
      // Check localStorage for custom mock orders first
      const customOrders = JSON.parse(
        localStorage.getItem('cara_custom_mock_orders') || '{}',
      );
      const order = customOrders[orderIdRaw] || MOCK_ORDERS[orderIdRaw];

      // For demo purposes any email works for the demo order
      if (order) {
        renderResult(order);
      } else {
        showError();
      }
    }, 1600);
  });
}

// ── Set loading state on button ───────────────────────────
function setLoading(isLoading) {
  if (isLoading) {
    trackBtn.classList.add('loading');
    trackBtn.disabled = true;
  } else {
    trackBtn.classList.remove('loading');
    trackBtn.disabled = false;
  }
}

// ── Render the result card ────────────────────────────────
function renderResult(order) {
  // Save order tracking parameters to localStorage for history retention
  localStorage.setItem('cara_last_tracked_id', order.id);
  const emailInput = document.getElementById('orderEmail');
  if (emailInput) {
    localStorage.setItem('cara_last_tracked_email', emailInput.value.trim());
  }

  // Populate header
  document.getElementById('resultOrderId').textContent = order.id;
  document.getElementById('statusText').textContent = order.status;
  document.getElementById('orderDate').textContent = order.date;
  document.getElementById('orderCarrier').textContent = order.carrier;
  document.getElementById('trackingNo').textContent = order.trackingNo;
  document.getElementById('estDelivery').textContent = order.estDelivery;

  // Status badge colour
  const badge = document.getElementById('statusBadge');
  badge.className = 'order-status-badge';
  if (order.status === 'Delivered') badge.classList.add('delivered');
  if (order.status === 'In Transit') badge.classList.add('in-transit');

  // Dynamic live progress bar tracker (Simulated Distance Cover)
  let liveContainer = document.getElementById('liveProgressBarWrap');
  if (!liveContainer) {
    liveContainer = document.createElement('div');
    liveContainer.id = 'liveProgressBarWrap';
    liveContainer.style.cssText =
      'background: rgba(8, 129, 120, 0.08); padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid rgba(8, 129, 120, 0.15);';
    liveContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; font-weight: 600; color: #088178;">
        <span>Simulated Delivery Progress</span>
        <span id="liveProgressPercent">62%</span>
      </div>
      <div style="background: rgba(0,0,0,0.1); height: 8px; border-radius: 4px; overflow: hidden; position: relative;">
        <div id="liveProgressBar" style="background: #088178; height: 100%; width: 62%; transition: width 1s linear;"></div>
      </div>
      <span style="display: block; font-size: 11px; color: #666; margin-top: 6px; font-style: italic;">Live simulated parcel dispatch tracing active...</span>
    `;
    const detailsWrap = document.querySelector('.result-grid');
    if (detailsWrap)
      detailsWrap.parentNode.insertBefore(liveContainer, detailsWrap);
  }

  // Animate simulated progress bar dynamically.
  // Clear any existing timer first so repeated lookups don't stack intervals.
  if (progressTimer !== null) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  let currentPct = 62;
  progressTimer = setInterval(() => {
    if (currentPct < 99) {
      currentPct += Math.random() * 0.5 + 0.1;
      const bar = document.getElementById('liveProgressBar');
      const label = document.getElementById('liveProgressPercent');
      if (bar) bar.style.width = currentPct.toFixed(1) + '%';
      if (label) label.textContent = currentPct.toFixed(1) + '%';
    } else {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }, 3000);

  // Populate timeline with sequential stagger transitions
  const steps = ['ordered', 'packed', 'shipped', 'transit', 'delivered'];
  steps.forEach(function (key, index) {
    const stepEl = document.getElementById('step-' + key);
    if (!stepEl) return;

    const stepData = order.timeline[key];
    stepEl.classList.remove('completed', 'active');

    // Update text immediately
    const pEl = stepEl.querySelector('.step-content p');
    const timeEl = stepEl.querySelector('.step-content time');
    if (pEl) pEl.textContent = stepData.note;
    if (timeEl) timeEl.textContent = stepData.date;

    // Stagger transition animations by applying active/completed classes with timeouts
    setTimeout(() => {
      if (stepData.active) {
        stepEl.classList.add('active');
      } else if (stepData.done) {
        stepEl.classList.add('completed');
      }

      // Trigger a slight scale transition on the icon
      const icon = stepEl.querySelector('.step-icon');
      if (icon) {
        icon.style.transform = 'scale(1.1)';
        setTimeout(() => {
          icon.style.transform = 'scale(1)';
        }, 300);
      }
    }, index * 200); // 200ms stagger delay
  });

  // Populate order items
  const itemsList = document.getElementById('orderItemsList');
  if (itemsList && order.items) {
    itemsList.innerHTML = '';
    order.items.forEach(function (item) {
      const orderItem = document.createElement('div');
      orderItem.className = 'order-item';

      const img = document.createElement('img');
      img.src = item.img;
      img.alt = item.name;
      img.loading = 'lazy';

      const info = document.createElement('div');
      info.className = 'item-info';

      const name = document.createElement('h4');
      name.textContent = item.name;

      const sizeQty = document.createElement('span');
      sizeQty.textContent = `Size: ${item.size}  |  Qty: ${item.qty}`;

      info.appendChild(name);
      info.appendChild(sizeQty);

      const price = document.createElement('span');
      price.className = 'item-price';
      price.textContent = item.price;

      orderItem.appendChild(img);
      orderItem.appendChild(info);
      orderItem.appendChild(price);

      itemsList.appendChild(orderItem);
    });

    // Update total
    const totalEl = document.querySelector('.order-total-row strong');
    if (totalEl) totalEl.textContent = order.total;
  }

  // Hide form, show result
  hideAll();
  resultCard.style.display = 'block';
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function calculateEstimatedDelivery(orderDateStr, carrier) {
  const orderDate = new Date(orderDateStr);
  if (isNaN(orderDate.getTime())) return orderDateStr;

  let daysToAdd = 5; // Standard Shipping
  if (carrier === 'FedEx Express') daysToAdd = 2;
  if (carrier === 'Next Day Air') daysToAdd = 1;

  orderDate.setDate(orderDate.getDate() + daysToAdd);
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  return orderDate.toLocaleDateString('en-US', options);
}

// Auto-fill tracked order from localStorage if available
document.addEventListener('DOMContentLoaded', () => {
  const cachedId = localStorage.getItem('cara_last_tracked_id');
  const cachedEmail = localStorage.getItem('cara_last_tracked_email');
  if (cachedId && document.getElementById('orderId')) {
    document.getElementById('orderId').value = cachedId;
  }
  if (cachedEmail && document.getElementById('orderEmail')) {
    document.getElementById('orderEmail').value = cachedEmail;
  }

  // Toggle creator form visibility
  const toggleBtn = document.getElementById('toggleCreatorBtn');
  const creatorContainer = document.getElementById('mockCreatorFormContainer');
  if (toggleBtn && creatorContainer) {
    toggleBtn.addEventListener('click', () => {
      creatorContainer.classList.toggle('hidden');
    });
  }

  // Handle Mock Order Form Submission
  const createMockForm = document.getElementById('createMockForm');
  if (createMockForm) {
    createMockForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const orderId = document
        .getElementById('mockOrderId')
        .value.trim()
        .toUpperCase();
      const email = document
        .getElementById('mockEmail')
        .value.trim()
        .toLowerCase();
      const carrier = document.getElementById('mockCarrier').value;
      const status = document.getElementById('mockStatus').value;

      const now = new Date();
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      const dateStr = now.toLocaleDateString('en-US', options);

      // Calculate dynamic estimated delivery
      const estDelivery = calculateEstimatedDelivery(dateStr, carrier);

      // Map status to current step
      let currentStep = 'ordered';
      if (status === 'Packed') currentStep = 'packed';
      if (status === 'Shipped') currentStep = 'shipped';
      if (status === 'In Transit') currentStep = 'transit';
      if (status === 'Delivered') currentStep = 'delivered';

      // Build dynamic timeline step info
      const customMockOrder = {
        id: orderId,
        date: dateStr,
        carrier: carrier,
        trackingNo: Math.floor(100000000000 + Math.random() * 900000000000)
          .toString()
          .replace(/(\d{4})/g, '$1 ')
          .trim(),
        estDelivery: estDelivery,
        status: status,
        currentStep: currentStep,
        location: 'Local Sort Facility',
        items: [
          {
            name: 'Cartoon Astronaut T-Shirt',
            img: 'images/products/f1.jpg',
            size: 'M',
            qty: 1,
            price: '$78.00',
          },
        ],
        total: '$78.00',
        timeline: {
          ordered: {
            done: true,
            date: dateStr + ' — 10:00 AM',
            note: 'Your order has been confirmed and is being processed.',
          },
          packed: {
            done: status !== 'Processing',
            active: status === 'Packed',
            date: status === 'Processing' ? 'Pending' : dateStr + ' — 2:00 PM',
            note: 'Your items have been packed and are ready for pickup.',
          },
          shipped: {
            done: status !== 'Processing' && status !== 'Packed',
            active: status === 'Shipped',
            date:
              status === 'Processing' || status === 'Packed'
                ? 'Pending'
                : dateStr + ' — 5:00 PM',
            note: 'Your package has been handed off to the carrier.',
          },
          transit: {
            done: status === 'Delivered',
            active: status === 'In Transit',
            date:
              status === 'Delivered'
                ? dateStr + ' — 9:00 AM'
                : status === 'In Transit'
                  ? 'Today'
                  : 'Pending',
            note: 'Your package is on its way.',
          },
          delivered: {
            done: status === 'Delivered',
            active: status === 'Delivered',
            date:
              status === 'Delivered'
                ? dateStr + ' — 12:00 PM'
                : 'Expected: ' + estDelivery,
            note:
              status === 'Delivered'
                ? 'Your package has been delivered.'
                : 'Your package will be delivered to your door.',
          },
        },
      };

      // Retrieve existing custom mock orders
      const customOrders = JSON.parse(
        localStorage.getItem('cara_custom_mock_orders') || '{}',
      );
      customOrders[orderId] = customMockOrder;
      localStorage.setItem(
        'cara_custom_mock_orders',
        JSON.stringify(customOrders),
      );

      // Auto pre-fill track form
      const orderIdInput = document.getElementById('orderId');
      const emailInput = document.getElementById('orderEmail');
      if (orderIdInput) orderIdInput.value = orderId;
      if (emailInput) emailInput.value = email;

      // Reset forms and hide mock form
      createMockForm.reset();
      creatorContainer.classList.add('hidden');

      // Trigger search submission
      document
        .getElementById('trackOrderForm')
        .dispatchEvent(new Event('submit'));
    });
  }
});

// ── Show error card ───────────────────────────────────────
function showError() {
  hideAll();
  errorCard.style.display = 'block';
  errorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Hide all panels ───────────────────────────────────────
function hideAll() {
  formCard.style.display = 'none';
  resultCard.style.display = 'none';
  errorCard.style.display = 'none';
}

// ── Reset back to the search form ─────────────────────────
function resetTracker() {
  // Stop the progress bar animation before leaving the result view
  if (progressTimer !== null) {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  formCard.style.display = 'block';
  resultCard.style.display = 'none';
  errorCard.style.display = 'none';

  // Clear fields
  const orderIdInput = document.getElementById('orderId');
  const emailInput = document.getElementById('orderEmail');
  if (orderIdInput) orderIdInput.value = '';
  if (emailInput) emailInput.value = '';

  formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── FAQ accordion ─────────────────────────────────────────
function toggleFaq(questionEl) {
  const answerEl = questionEl.nextElementSibling;
  const isOpen = questionEl.classList.contains('open');

  // Close all first
  document.querySelectorAll('.faq-question').forEach(function (q) {
    q.classList.remove('open');
    const a = q.nextElementSibling;
    if (a) a.classList.remove('open');
  });

  // If it was closed, open it
  if (!isOpen) {
    questionEl.classList.add('open');
    if (answerEl) answerEl.classList.add('open');
  }
}

// ── Cleanup on page unload ────────────────────────────────
window.addEventListener('beforeunload', function () {
  if (progressTimer !== null) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
});

// Bind globally to satisfy linter for inline HTML attributes
window.resetTracker = resetTracker;
window.toggleFaq = toggleFaq;
