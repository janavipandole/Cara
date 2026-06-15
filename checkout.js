function safeParseJSON(key, fallback = '[]') {
  try {
    return JSON.parse(localStorage.getItem(key) || fallback);
  } catch {
    try { return JSON.parse(fallback); } catch { return []; }
  }
}

const paymentMethod = document.getElementById("paymentMethod");
const cardDetails = document.getElementById("cardDetails");

const cardName = document.getElementById("cardName");
const cardNumber = document.getElementById("cardNumber");
const expiry = document.getElementById("expiry");
const cvv = document.getElementById("cvv");
const paymentFields = [cardName, cardNumber, expiry, cvv];

// --- Validators ---
const validators = {
  required: (val) => val.trim() !== "",
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
  phone: (val) => /^\+?[\d\s\-]{7,15}$/.test(val.trim()),
  cardNumber: (val) => {
    const raw = val.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(raw)) return false;
    
    // Luhn checksum algorithm implementation
    let sum = 0;
    let shouldDouble = false;
    for (let i = raw.length - 1; i >= 0; i--) {
      let digit = parseInt(raw.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  },
  expiry: (val) => {
    const value = val.trim();
    const match = value.match(/^(0[1-9]|1[0-2])\/\d{2}$/);
    if (!match) return false;

    const month = Number(match[1]);
    const year = Number("20" + match[2]);
    if (month < 1 || month > 12) return false;

    const currentDate = new Date();
    // Expiry date is the last day of the expiry month
    const expiryDate = new Date(year, month, 0, 23, 59, 59);

    return expiryDate > currentDate;
  },
  cvv: (val) => /^\d{3,4}$/.test(val.trim()),
  zip: (val) => /^\d{4,10}$/.test(val.trim()),
};

const errorMessages = {
  fullName:   "Full name is required",
  email:      "Please enter a valid email (e.g. user@example.com)",
  phone:      "Please enter a valid phone number",
  address:    "Address is required",
  city:       "City is required",
  zip:        "Please enter a valid ZIP/postal code",
  paymentMethod: "Please select a payment method",
  cardName:   "Card holder name is required",
  cardNumber: "Card number is invalid (Luhn Check failed)",
  expiry:     "Please enter a valid future expiry date (MM/YY)",
  cvv:        "CVV must be 3-4 digits",
};

// --- Utility Functions ---
function parsePriceString(priceStr) {
  if (typeof priceStr === "number") return isFinite(priceStr) ? priceStr : 0;
  if (!priceStr) return 0;
  var cleaned = String(priceStr).replace(/[₹$,\s]/g, "").replace(/&#?\w+;/g, "");
  var num = parseFloat(cleaned);
  return isFinite(num) ? num : 0;
}

function formatCurrency(amount) {
  var num = typeof amount === "number" ? amount : parsePriceString(amount);
  if (!isFinite(num)) num = 0;
  return "₹" + Math.round(num).toLocaleString("en-IN");
}

// --- Dynamic Summary Rendering ---
function loadCheckoutSummary() {
  const cart = safeParseJSON("productsInCart");
  const container = document.getElementById("checkout-items-container");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Your cart is empty.</p>';
    return;
  }

  container.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item) => {
    const itemPrice = parsePriceString(item.price);
    const itemQty = parseInt(item.quantity) || 1;
    const itemSubtotal = itemPrice * itemQty;
    subtotal += itemSubtotal;

    const div = document.createElement("div");
    div.className = "order-item";
    div.innerHTML = `
      <div class="item-thumb"><img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;"></div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-meta">${item.brand || "Premium Brand"} · Size ${item.size || "N/A"} · Qty ${itemQty}</div>
      </div>
      <div class="item-price">${formatCurrency(itemSubtotal)}</div>
    `;
    container.appendChild(div);
  });

  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.getElementById("checkout-shipping");
  const taxEl = document.getElementById("checkout-tax");
  const totalEl = document.getElementById("checkout-total");

  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

  const shipping = subtotal >= 3000 ? 0 : 150;
  if (shippingEl) {
    shippingEl.textContent = shipping === 0 ? "Free" : formatCurrency(shipping);
  }

  const tax = Math.round(subtotal * 0.18); // 18% GST as per cart.html
  if (taxEl) taxEl.textContent = formatCurrency(tax);

  const grandTotal = subtotal + shipping + tax;
  if (totalEl) totalEl.textContent = formatCurrency(grandTotal);
}

// --- Validate a single field ---
function validateField(input) {
  const field = input.dataset.validate;
  if (!field) return true;

  // Only validate card fields if payment method is online
  if (["cardName", "cardNumber", "expiry", "cvv"].includes(field)) {
    if (!paymentMethod || paymentMethod.value !== "online") {
      input.classList.remove("is-valid", "is-invalid");
      const errEl = input.parentElement.querySelector(".error-msg");
      if (errEl) errEl.textContent = "";
      return true;
    }
  }

  const value = input.value;
  let isValid = true;

  if (field === "email")      isValid = validators.email(value);
  else if (field === "phone") isValid = validators.phone(value);
  else if (field === "cardNumber") isValid = validators.cardNumber(value);
  else if (field === "expiry") isValid = validators.expiry(value);
  else if (field === "cvv")   isValid = validators.cvv(value);
  else if (field === "zip")   isValid = validators.zip(value);
  else                        isValid = validators.required(value);

  // Update classes
  input.classList.toggle("is-valid", isValid);
  input.classList.toggle("is-invalid", !isValid);

  // Show/hide error message
  const errEl = input.parentElement.querySelector(".error-msg");
  if (errEl) {
    errEl.textContent = isValid ? "" : (errorMessages[field] || "This field is required");
  }

  return isValid;
}

// --- Attach real-time validation listeners ---
function initCheckoutValidation() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const inputs = form.querySelectorAll("input[data-validate], textarea[data-validate], select[data-validate]");

  inputs.forEach((input) => {
    // Validate on blur (when user leaves field)
    input.addEventListener("blur", () => validateField(input));

    // Validate on input (live feedback) only after first touch results in error
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) {
        validateField(input);
      }
    });

    // Special listener for select change
    if (input.tagName === "SELECT") {
      input.addEventListener("change", () => {
        validateField(input);
      });
    }
  });
}

// --- Auto-formatting helper functions ---
function getDigits(value) {
  return value.replace(/\D/g, "");
}

// Format card number with spaces (1234 5678 9012 3456)
if (cardNumber) cardNumber.addEventListener("input", function (e) {
  let val = getDigits(e.target.value).slice(0, 16);
  e.target.value = val.replace(/(.{4})/g, "$1 ").trim();
  
  if (this.classList.contains("is-invalid")) {
    validateField(this);
  }
});

// Format expiry date (MM/YY)
expiry.addEventListener("input", function (e) {
  let val = getDigits(e.target.value).slice(0, 4);
  if (val.length >= 3) {
    val = val.slice(0, 2) + "/" + val.slice(2);
  }
  e.target.value = val;

  if (this.classList.contains("is-invalid")) {
    validateField(this);
  }
});

// Restrict CVV input to digits and length
cvv.addEventListener("input", function () {
  this.value = getDigits(this.value).slice(0, 4);
  if (this.classList.contains("is-invalid")) {
    validateField(this);
  }
});

cardName.addEventListener("input", function () {
  if (this.classList.contains("is-invalid")) {
    validateField(this);
  }
});

// --- Show/Hide Card Details and clear validation states ---
paymentMethod.addEventListener("change", function () {
  if (this.value === "online") {
    cardDetails.style.display = "block";
    cardName.required = true;
    cardNumber.required = true;
    expiry.required = true;
    cvv.required = true;
  } else {
    cardDetails.style.display = "none";
    cardName.required = false;
    cardNumber.required = false;
    expiry.required = false;
    cvv.required = false;
    
    // Clear card fields and errors
    paymentFields.forEach(function (field) {
      field.value = "";
      field.classList.remove("is-valid", "is-invalid");
      const errEl = field.parentElement.querySelector(".error-msg");
      if (errEl) errEl.textContent = "";
    });
  }

  if (this.classList.contains("is-invalid")) {
    validateField(this);
  }
});

// --- Form Submission & Final Validation Check ---
const form = document.getElementById("checkoutForm");
const popup = document.getElementById("successOverlay");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = form.querySelectorAll("input[data-validate], textarea[data-validate], select[data-validate]");
  let allValid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) {
      allValid = false;
    }
  });

  if (!allValid) {
    // Scroll to the first invalid field
    const firstInvalid = form.querySelector(".is-invalid");
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.focus();
    }
    return;
  }

  // GET CART
  let cart = safeParseJSON('productsInCart');

  // CHECK EMPTY CART
  if (cart.length === 0) {
    if (typeof showToast === 'function') showToast('Your cart is empty!', 'error');
    else alert('Your cart is empty!');
    return;
  }

// Required contact/address fields
const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'zip'];

for (const id of requiredFields) {
  const el = document.getElementById(id);

  if (!el) {
    console.error(`Missing input field with id: ${id}`);
    continue;
  }

  if (!el.value.trim()) {
    allValid = false;
    validateField(el);
  }
}

if (!allValid) return;

// ── Loading state: disable button & show spinner ──
const submitBtn = form.querySelector(".submit-btn");

if (submitBtn) {
  submitBtn.classList.add("btn-loading");
  submitBtn.disabled = true;
}

  // Simulate async order processing
  setTimeout(function () {
    // CLEAR CART AFTER SUCCESSFUL ORDER
    localStorage.removeItem("productsInCart");
    localStorage.removeItem("appliedCoupon");
    window.appliedCoupon = null;

    if (submitBtn) {
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }

    form.reset();

    // HIDE CARD DETAILS AGAIN
    cardDetails.style.display = "none";
    popup.classList.add("active");

    // Clear all validation states post-submit
    inputs.forEach((input) => {
      input.classList.remove("is-valid", "is-invalid");
      const errEl = input.parentElement.querySelector(".error-msg");
      if (errEl) errEl.textContent = "";
    });
    
    // Refresh summary (it will be empty)
    loadCheckoutSummary();
  }, 1500);
});

function closePopup() {
  popup.classList.remove("active");
}

// Call init on DOM ready
function init() {
  initCheckoutValidation();
  loadCheckoutSummary();
}

document.addEventListener("DOMContentLoaded", init);
// If DOMContentLoaded already fired, call it directly
if (document.readyState === "interactive" || document.readyState === "complete") {
  init();
}

// ── Close popup when clicking outside the box ─────────────
const successOverlay = document.getElementById('successOverlay');
if (successOverlay) {
  successOverlay.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('active');
  });
}
// Advanced validation routines checking postal formats and shipping address boundaries.