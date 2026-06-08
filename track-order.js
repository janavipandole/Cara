/**
 * track-order.js
 * Handles the Track My Order page functionality for the Cara e-commerce project.
 * Resolves GitHub Issue #302
 */

// ── Dynamic copyright year ────────────────────────────────
const copyrightYearEl = document.getElementById("copyrightYear");
if (copyrightYearEl) {
  copyrightYearEl.textContent = new Date().getFullYear();
}

// ── Mock order database ───────────────────────────────────
// In a real app this would be a backend API call.
// We use a demo entry so reviewers can test the UI immediately.
const MOCK_ORDERS = {
  "CARA-20261234": {
    id: "CARA-20261234",
    date: "May 14, 2026",
    carrier: "FedEx Express",
    trackingNo: "7489 2091 3847",
    estDelivery: "May 20, 2026",
    status: "In Transit",          // "Processing" | "Packed" | "Shipped" | "In Transit" | "Delivered"
    currentStep: "transit",        // ordered | packed | shipped | transit | delivered
    location: "Chicago, IL",
    items: [
      {
        name: "Cartoon Astronaut T-Shirt",
        img: "images/products/f1.jpg",
        size: "M",
        qty: 1,
        price: "$78.00",
      },
      {
        name: "Classic Hoodie",
        img: "images/products/n2.jpg",
        size: "L",
        qty: 2,
        price: "$156.00",
      },
    ],
    total: "$234.00",
    timeline: {
      ordered: { done: true,  date: "May 14, 2026 — 10:32 AM", note: "Your order has been confirmed and is being processed." },
      packed:  { done: true,  date: "May 15, 2026 — 2:14 PM",  note: "Your items have been packed and are ready for pickup." },
      shipped: { done: true,  date: "May 16, 2026 — 9:05 AM",  note: "Your package has been handed off to FedEx Express." },
      transit: { done: false, date: "May 18, 2026 — 6:45 AM",  note: "Your package is on its way — currently in Chicago, IL.", active: true },
      delivered:{ done: false,date: "Expected: May 20, 2026",   note: "Your package will be delivered to your door." },
    },
  },
};

// ── DOM references ────────────────────────────────────────
const form        = document.getElementById("trackOrderForm");
const trackBtn    = document.getElementById("trackBtn");
const btnLoader   = document.getElementById("btnLoader");
const formCard    = document.querySelector(".track-form-card");
const resultCard  = document.getElementById("trackResult");
const errorCard   = document.getElementById("trackError");

// ── Form submit handler ───────────────────────────────────
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const orderIdRaw = document.getElementById("orderId").value.trim().toUpperCase();
    const emailRaw   = document.getElementById("orderEmail").value.trim().toLowerCase();

    // Basic validation
    if (!orderIdRaw || !emailRaw) return;

    // Simulate an async API call with a loading state
    setLoading(true);

    setTimeout(function () {
      setLoading(false);
      const order = MOCK_ORDERS[orderIdRaw];

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
    trackBtn.classList.add("loading");
    trackBtn.disabled = true;
  } else {
    trackBtn.classList.remove("loading");
    trackBtn.disabled = false;
  }
}

// ── Render the result card ────────────────────────────────
function renderResult(order) {
  // Save order tracking parameters to localStorage for history retention
  localStorage.setItem("cara_last_tracked_id", order.id);
  const emailInput = document.getElementById("orderEmail");
  if (emailInput) {
    localStorage.setItem("cara_last_tracked_email", emailInput.value.trim());
  }

  // Populate header
  document.getElementById("resultOrderId").textContent = order.id;
  document.getElementById("statusText").textContent    = order.status;
  document.getElementById("orderDate").textContent     = order.date;
  document.getElementById("orderCarrier").textContent  = order.carrier;
  document.getElementById("trackingNo").textContent    = order.trackingNo;
  document.getElementById("estDelivery").textContent   = order.estDelivery;

  // Status badge colour
  const badge = document.getElementById("statusBadge");
  badge.className = "order-status-badge";
  if (order.status === "Delivered") badge.classList.add("delivered");
  if (order.status === "In Transit") badge.classList.add("in-transit");

  // Dynamic live progress bar tracker (Simulated Distance Cover)
  let liveContainer = document.getElementById("liveProgressBarWrap");
  if (!liveContainer) {
    liveContainer = document.createElement("div");
    liveContainer.id = "liveProgressBarWrap";
    liveContainer.style.cssText = "background: rgba(8, 129, 120, 0.08); padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid rgba(8, 129, 120, 0.15);";
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
    const detailsWrap = document.querySelector(".result-grid");
    if (detailsWrap) detailsWrap.parentNode.insertBefore(liveContainer, detailsWrap);
  }

  // Animate simulated progress bar dynamically
  let currentPct = 62;
  const progressTimer = setInterval(() => {
    if (currentPct < 99) {
      currentPct += (Math.random() * 0.5 + 0.1);
      const bar = document.getElementById("liveProgressBar");
      const label = document.getElementById("liveProgressPercent");
      if (bar) bar.style.width = currentPct.toFixed(1) + "%";
      if (label) label.textContent = currentPct.toFixed(1) + "%";
    } else {
      clearInterval(progressTimer);
    }
  }, 3000);

  // Populate timeline
  const steps = ["ordered", "packed", "shipped", "transit", "delivered"];
  steps.forEach(function (key) {
    const stepEl = document.getElementById("step-" + key);
    if (!stepEl) return;

    const stepData = order.timeline[key];
    stepEl.classList.remove("completed", "active");

    if (stepData.active) {
      stepEl.classList.add("active");
    } else if (stepData.done) {
      stepEl.classList.add("completed");
    }

    // Update text
    const pEl   = stepEl.querySelector(".step-content p");
    const timeEl = stepEl.querySelector(".step-content time");
    if (pEl)    pEl.textContent   = stepData.note;
    if (timeEl) timeEl.textContent = stepData.date;
  });

  // Populate order items
  const itemsList = document.getElementById("orderItemsList");
  if (itemsList && order.items) {
    itemsList.innerHTML = order.items.map(function (item) {
      return `
        <div class="order-item">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
          <div class="item-info">
            <h4>${item.name}</h4>
            <span>Size: ${item.size} &nbsp;|&nbsp; Qty: ${item.qty}</span>
          </div>
          <span class="item-price">${item.price}</span>
        </div>
      `;
    }).join("");

    // Update total
    const totalEl = document.querySelector(".order-total-row strong");
    if (totalEl) totalEl.textContent = order.total;
  }

  // Hide form, show result
  hideAll();
  resultCard.style.display = "block";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Auto-fill tracked order from localStorage if available
document.addEventListener("DOMContentLoaded", () => {
  const cachedId = localStorage.getItem("cara_last_tracked_id");
  const cachedEmail = localStorage.getItem("cara_last_tracked_email");
  if (cachedId && document.getElementById("orderId")) {
    document.getElementById("orderId").value = cachedId;
  }
  if (cachedEmail && document.getElementById("orderEmail")) {
    document.getElementById("orderEmail").value = cachedEmail;
  }
});

// ── Show error card ───────────────────────────────────────
function showError() {
  hideAll();
  errorCard.style.display = "block";
  errorCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Hide all panels ───────────────────────────────────────
function hideAll() {
  formCard.style.display   = "none";
  resultCard.style.display = "none";
  errorCard.style.display  = "none";
}

// ── Reset back to the search form ─────────────────────────
function resetTracker() {
  formCard.style.display   = "block";
  resultCard.style.display = "none";
  errorCard.style.display  = "none";

  // Clear fields
  const orderIdInput = document.getElementById("orderId");
  const emailInput   = document.getElementById("orderEmail");
  if (orderIdInput) orderIdInput.value = "";
  if (emailInput)   emailInput.value   = "";

  formCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── FAQ accordion ─────────────────────────────────────────
function toggleFaq(questionEl) {
  const answerEl = questionEl.nextElementSibling;
  const isOpen   = questionEl.classList.contains("open");

  // Close all first
  document.querySelectorAll(".faq-question").forEach(function (q) {
    q.classList.remove("open");
    const a = q.nextElementSibling;
    if (a) a.classList.remove("open");
  });

  // If it was closed, open it
  if (!isOpen) {
    questionEl.classList.add("open");
    if (answerEl) answerEl.classList.add("open");
  }
}

// Timeline animator simulating transitions through shipping progress milestones.