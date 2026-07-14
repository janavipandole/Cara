let checkoutIdempotencyKey = null;

function safeParseJSON(key, fallback = '[]') {
  try {
    return JSON.parse(localStorage.getItem(key) || fallback);
  } catch {
    try {
      return JSON.parse(fallback);
    } catch {
      return [];
    }
  }
}

const API_BASE_URL = window.CARA_API_BASE_URL || 'http://127.0.0.1:8000';

function getStoredAuthToken() {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('cara_user_token') ||
    ''
  );
}

function buildAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = getStoredAuthToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

const paymentMethod = document.getElementById('paymentMethod');
const cardDetails = document.getElementById('cardDetails');

const cardName = document.getElementById('cardName');
const cardNumber = document.getElementById('cardNumber');
const expiry = document.getElementById('expiry');
const cvv = document.getElementById('cvv');
const paymentFields = [cardName, cardNumber, expiry, cvv];

// --- Validators ---
const validators = {
  required: (val) => val.trim() !== '',
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
  phone: (val) => /^\+?[\d\s-]{7,15}$/.test(val.trim()),
  cardNumber: (val) => {
    const raw = val.replace(/\s/g, '');
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
    const year = Number('20' + match[2]);
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
  fullName: 'Full name is required',
  email: 'Please enter a valid email (e.g. user@example.com)',
  phone: 'Please enter a valid phone number',
  address: 'Address is required',
  city: 'City is required',
  zip: 'Please enter a valid ZIP/postal code',
  paymentMethod: 'Please select a payment method',
  cardName: 'Card holder name is required',
  cardNumber: 'Card number is invalid (Luhn Check failed)',
  expiry: 'Please enter a valid future expiry date (MM/YY)',
  cvv: 'CVV must be 3-4 digits',
};

// --- Validate a single field ---
function validateField(input) {
  const field = input.dataset.validate;
  if (!field) return true;

  // Only validate card fields if payment method is online
  if (['cardName', 'cardNumber', 'expiry', 'cvv'].includes(field)) {
    if (!paymentMethod || paymentMethod.value !== 'online') {
      input.classList.remove('is-valid', 'is-invalid');
      const errEl = input.parentElement.querySelector('.error-msg');
      if (errEl) errEl.textContent = '';
      return true;
    }
  }

  const value = input.value;
  let isValid = true;

  if (field === 'email') isValid = validators.email(value);
  else if (field === 'phone') isValid = validators.phone(value);
  else if (field === 'cardNumber') isValid = validators.cardNumber(value);
  else if (field === 'expiry') isValid = validators.expiry(value);
  else if (field === 'cvv') isValid = validators.cvv(value);
  else if (field === 'zip') isValid = validators.zip(value);
  else isValid = validators.required(value);

  // Update classes
  input.classList.toggle('is-valid', isValid);
  input.classList.toggle('is-invalid', !isValid);

  // Show/hide error message
  const errEl = input.parentElement.querySelector('.error-msg');
  if (errEl) {
    errEl.textContent = isValid
      ? ''
      : errorMessages[field] || 'This field is required';
  }

  return isValid;
}

// --- Attach real-time validation listeners ---
function initCheckoutValidation() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const inputs = form.querySelectorAll(
    'input[data-validate], textarea[data-validate], select[data-validate]'
  );

  inputs.forEach((input) => {
    // Validate on blur (when user leaves field)
    input.addEventListener('blur', () => validateField(input));

    // Validate on input (live feedback) only after first touch results in error
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(input);
      }
    });

    // Special listener for select change
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => {
        validateField(input);
      });
    }
  });
}

// --- Auto-formatting helper functions ---
function getDigits(value) {
  return value.replace(/\D/g, '');
}

// Format card number with spaces (1234 5678 9012 3456)
if (cardNumber)
  cardNumber.addEventListener('input', function (e) {
    let val = getDigits(e.target.value).slice(0, 16);
    e.target.value = val.replace(/(.{4})/g, '$1 ').trim();

    if (this.classList.contains('is-invalid')) {
      validateField(this);
    }
  });

// Format expiry date (MM/YY)
expiry.addEventListener('input', function (e) {
  let val = getDigits(e.target.value).slice(0, 4);
  if (val.length >= 3) {
    val = val.slice(0, 2) + '/' + val.slice(2);
  }
  e.target.value = val;

  if (this.classList.contains('is-invalid')) {
    validateField(this);
  }
});

// Restrict CVV input to digits and length
cvv.addEventListener('input', function () {
  this.value = getDigits(this.value).slice(0, 4);
  if (this.classList.contains('is-invalid')) {
    validateField(this);
  }
});

cardName.addEventListener('input', function () {
  if (this.classList.contains('is-invalid')) {
    validateField(this);
  }
});

// --- Show/Hide Card Details and clear validation states ---
paymentMethod.addEventListener('change', function () {
  if (this.value === 'online') {
    cardDetails.style.display = 'block';
    cardName.required = true;
    cardNumber.required = true;
    expiry.required = true;
    cvv.required = true;
  } else {
    cardDetails.style.display = 'none';
    cardName.required = false;
    cardNumber.required = false;
    expiry.required = false;
    cvv.required = false;

    // Clear card fields and errors
    paymentFields.forEach(function (field) {
      field.value = '';
      field.classList.remove('is-valid', 'is-invalid');
      const errEl = field.parentElement.querySelector('.error-msg');
      if (errEl) errEl.textContent = '';
    });
  }

  if (this.classList.contains('is-invalid')) {
    validateField(this);
  }
});

// --- Form Submission & Final Validation Check ---
const form = document.getElementById('checkoutForm');
const popup = document.getElementById('successPopup');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const inputs = form.querySelectorAll(
    'input[data-validate], textarea[data-validate], select[data-validate]'
  );
  let allValid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) {
      allValid = false;
    }
  });

  if (!allValid) {
    // Scroll to the first invalid field
    const firstInvalid = form.querySelector('.is-invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
    }
    return;
  }

  // GET CART
  let cart = safeParseJSON('productsInCart');

  // CHECK EMPTY CART
  if (cart.length === 0) {
    if (typeof window.showToast === 'function')
      window.showToast('Your cart is empty!', 'error');
    else console.log('Toast: ' + 'Your cart is empty!');
    return;
  }

  // Required contact/address fields
  const requiredFields = [
    'fullName',
    'email',
    'phone',
    'address',
    'city',
    'zip',
  ];

  for (const id of requiredFields) {
    const el = document.getElementById(id);

    if (!el) {
      window.logError(`Missing input field with id: ${id}`);
      return;
    }

    if (!el.value.trim()) {
      highlightError(el);
      return;
    }
  }

  // ── Loading state: disable button & show spinner ──
  const submitBtn = form.querySelector('.submit-btn');

  if (submitBtn) {
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
  }

  if (!checkoutIdempotencyKey) {
    checkoutIdempotencyKey = crypto.randomUUID();
  }

  // Prepare order data
  const orderData = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    zip: document.getElementById('zip').value.trim(),
    coupon: window.appliedCoupon,
    idempotency_key: checkoutIdempotencyKey,
    items: cart.map((item) => ({
      product_name: item.name,
      quantity: parseInt(item.quantity) || 1,
      price: item.price,
    })),
  };

  fetch(`${API_BASE_URL}/api/orders/`, {
    method: 'POST',
    headers: buildAuthHeaders({
      'Content-Type': 'application/json',
      'Idempotency-Key': checkoutIdempotencyKey,
    }),
    credentials: 'include',
    body: JSON.stringify(orderData),
  })
    .then((res) =>
      res
        .json()
        .then((data) => ({ status: res.status, ok: res.ok, body: data }))
    )
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.body.detail || 'Failed to place order');
      }

      // DEDUCT & ADD LOYALTY POINTS ON SUCCESSFUL ORDER
      const appliedPoints =
        parseInt(localStorage.getItem('cara_applied_loyalty_points')) || 0;
      const currentBalance =
        parseInt(localStorage.getItem('cara_loyalty_balance')) || 150;
      const subtotal = cart.reduce(
        (sum, item) =>
          sum + parsePriceString(item.price) * (parseInt(item.quantity) || 1),
        0
      );
      const earnedPoints = Math.floor(subtotal * 0.1);
      const newBalance = Math.max(
        0,
        currentBalance - appliedPoints + earnedPoints
      );
      localStorage.setItem('cara_loyalty_balance', newBalance);
      localStorage.removeItem('cara_applied_loyalty_points');

      // CLEAR CART AFTER SUCCESSFUL ORDER
      localStorage.removeItem('productsInCart');
      localStorage.removeItem('appliedCoupon');
      window.appliedCoupon = null;
      checkoutIdempotencyKey = null;

      if (submitBtn) {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        submitBtn.style.cursor = '';
        submitBtn.innerHTML =
          submitBtn.getAttribute('data-original-html') || 'Place Order';
      }

      form.reset();

      // HIDE CARD DETAILS AGAIN
      cardDetails.style.display = 'none';
      if (popup) popup.classList.add('show');

      // Clear all validation states post-submit
      inputs.forEach((input) => {
        input.classList.remove('is-valid', 'is-invalid');
        const errEl = input.parentElement.querySelector('.error-msg');
        if (errEl) errEl.textContent = '';
      });
    })
    .catch((err) => {
      if (typeof window.showToast === 'function')
        window.showToast(err.message, 'error');
      else console.log('Toast: ' + err.message);

      if (submitBtn) {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
      }
    });
});

window.closePopup = function () {
  const popup = document.getElementById('successPopup');
  if (popup) popup.classList.remove('show');
};

function parsePriceString(priceStr) {
  if (typeof priceStr === 'number') return isFinite(priceStr) ? priceStr : 0;
  if (!priceStr) return 0;
  const cleaned = String(priceStr)
    .replace(/[₹$,\s]/g, '')
    .replace(/&#?\w+;/g, '');
  const num = parseFloat(cleaned);
  return isFinite(num) ? num : 0;
}

function formatCurrency(amount) {
  const num = typeof amount === 'number' ? amount : parsePriceString(amount);
  if (!isFinite(num)) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

function renderCheckoutItems() {
  const container = document.getElementById('checkout-items-list');
  if (!container) return;

  const cart = safeParseJSON('productsInCart');
  if (cart.length === 0) {
    container.innerHTML =
      '<p style="font-size:14px; color:#555; text-align:center;">Your cart is empty.</p>';
    return;
  }

  container.innerHTML = cart
    .map((item) => {
      const itemPrice = parsePriceString(item.price);
      const itemQty = parseInt(item.quantity) || 1;
      const sizeStr = item.size ? `Size ${item.size}` : 'Standard';
      return `
      <div class="order-item" style="display: flex; gap: 15px; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 12px;">
        <div class="item-thumb" style="width: 50px; height: 50px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; background: #fff;">
          <img src="${item.img || 'images/products/placeholder.jpg'}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: cover;" onerror="this.src='images/products/placeholder.jpg'">
        </div>
        <div class="item-info" style="flex: 1;">
          <div class="item-name" style="font-weight: 600; font-size: 14px; color: var(--color-heading);">${item.name}</div>
          <div class="item-meta" style="font-size: 12px; color: #777;">${sizeStr} · Qty ${itemQty}</div>
        </div>
        <span class="item-price-col" style="font-weight: 600; font-size: 14px; color: #088178;">${formatCurrency(itemPrice * itemQty)}</span>
      </div>
    `;
    })
    .join('');
}

window.updateCheckoutSummary = function () {
  const cart = safeParseJSON('productsInCart');
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + parsePriceString(item.price) * (parseInt(item.quantity) || 1),
    0
  );

  // Check coupon discount
  const couponCode = localStorage.getItem('appliedCoupon') || '';
  const COUPONS = { CARA20: 20, WELCOME10: 10 };
  const couponPct = COUPONS[couponCode] || 0;
  const couponDiscount = subtotal * (couponPct / 100);

  // Check urgency discount (5%) if the timer is running
  const hasUrgency =
    !window.urgencyTimerExpired &&
    document.getElementById('checkout-promo-alert-bar');
  const urgencyDiscount = hasUrgency ? subtotal * 0.05 : 0;

  // Check gift wrap
  const hasGiftWrap = document.getElementById('gift-wrap-opt')?.checked;
  const giftCharge = hasGiftWrap ? 99 : 0;

  // Calculate tax (5%)
  const tax = subtotal * 0.05;

  // Check loyalty points discount (10 points = ₹1)
  const loyaltyPoints =
    parseInt(localStorage.getItem('cara_applied_loyalty_points')) || 0;
  const loyaltyDiscount = loyaltyPoints * 0.1;

  // Grand Total
  const grandTotal = Math.max(
    0,
    subtotal +
      tax +
      giftCharge -
      couponDiscount -
      urgencyDiscount -
      loyaltyDiscount
  );

  // Update DOM elements
  const subtotalEl = document.getElementById('summary-subtotal');
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

  const taxEl = document.getElementById('summary-tax');
  if (taxEl) taxEl.textContent = formatCurrency(tax);

  // Update Coupon Row
  let couponRow = document.getElementById('summaryDiscountRow');
  if (couponCode) {
    if (!couponRow) {
      couponRow = document.createElement('div');
      couponRow.className = 'total-row summary-row discount';
      couponRow.id = 'summaryDiscountRow';
      couponRow.style.cssText =
        'display:flex; justify-content:space-between; margin-bottom: 8px; color: #ef4444; font-weight: 600;';
      const grandRow = document.querySelector('.total-row.grand');
      if (grandRow) grandRow.parentNode.insertBefore(couponRow, grandRow);
    }
    couponRow.innerHTML = `
      <span>Discount (${couponCode}) <button type="button" class="btn-remove-coupon" id="btnRemoveCoupon" aria-label="Remove coupon" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size:16px; margin-left:5px; padding:0;">×</button></span>
      <span>-${formatCurrency(couponDiscount)}</span>
    `;
    const removeBtn = document.getElementById('btnRemoveCoupon');
    if (removeBtn) {
      removeBtn.onclick = function () {
        if (typeof window.removeCoupon === 'function') {
          window.removeCoupon();
        } else {
          localStorage.removeItem('appliedCoupon');
          window.updateCheckoutSummary();
          const couponInput = document.getElementById('couponCodeInput');
          if (couponInput) {
            couponInput.value = '';
            couponInput.classList.remove('is-valid', 'is-invalid');
          }
          const feedbackEl = document.getElementById('couponFeedback');
          if (feedbackEl) {
            feedbackEl.style.display = 'none';
            feedbackEl.textContent = '';
          }
        }
      };
    }
  } else {
    if (couponRow) couponRow.remove();
  }

  // Update Urgency Row
  let urgencyRow = document.getElementById('urgency-discount-row');
  if (urgencyDiscount > 0) {
    if (!urgencyRow) {
      urgencyRow = document.createElement('div');
      urgencyRow.id = 'urgency-discount-row';
      urgencyRow.className = 'total-row summary-row';
      urgencyRow.style.cssText =
        'display:flex; justify-content:space-between; margin-bottom: 8px; color: #e23e57; font-weight:700;';
      const divider = document.querySelector('.summary-divider');
      if (divider) divider.parentNode.insertBefore(urgencyRow, divider);
    }
    urgencyRow.innerHTML = `<span>Urgency Promo (5%)</span><span id='urgency-discount-val'>-${formatCurrency(urgencyDiscount)}</span>`;
  } else {
    if (urgencyRow) urgencyRow.remove();
  }

  // Update Gift Wrap Row
  let giftRow = document.getElementById('gift-wrap-charge-row');
  if (giftCharge > 0) {
    if (!giftRow) {
      giftRow = document.createElement('div');
      giftRow.id = 'gift-wrap-charge-row';
      giftRow.className = 'total-row summary-row';
      giftRow.style.cssText =
        'display:flex; justify-content:space-between; margin-bottom: 8px; color: #088178; font-weight: 600;';
      giftRow.innerHTML =
        "<span>Gift Wrapping Service</span><span style='color: #088178;'>₹99.00</span>";
      const subtotalRow = document
        .getElementById('summary-subtotal')
        ?.closest('.total-row');
      if (subtotalRow)
        subtotalRow.parentNode.insertBefore(giftRow, subtotalRow.nextSibling);
    }
  } else {
    if (giftRow) giftRow.remove();
  }

  // Update Loyalty Row
  let loyaltyRow = document.getElementById('summary-loyalty-row');
  if (loyaltyPoints > 0) {
    if (!loyaltyRow) {
      loyaltyRow = document.createElement('div');
      loyaltyRow.id = 'summary-loyalty-row';
      loyaltyRow.className = 'total-row summary-row discount';
      loyaltyRow.style.cssText =
        'display:flex; justify-content:space-between; margin-bottom: 8px; color: #ef4444; font-weight: 600;';
      const grandRow = document.querySelector('.total-row.grand');
      if (grandRow) grandRow.parentNode.insertBefore(loyaltyRow, grandRow);
    }
    loyaltyRow.innerHTML = `
      <span>Redeemed Points (${loyaltyPoints} pts) <button type="button" class="btn-remove-loyalty" id="btnRemoveLoyalty" aria-label="Remove loyalty points" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size:16px; margin-left:5px; padding:0;">×</button></span>
      <span>-${formatCurrency(loyaltyDiscount)}</span>
    `;
    const removeLoyaltyBtn = document.getElementById('btnRemoveLoyalty');
    if (removeLoyaltyBtn) {
      removeLoyaltyBtn.onclick = function () {
        localStorage.removeItem('cara_applied_loyalty_points');
        const pointsInput = document.getElementById('points-to-apply');
        if (pointsInput) pointsInput.value = '';
        const msgEl = document.getElementById('loyalty-msg');
        if (msgEl) {
          msgEl.textContent = '';
          msgEl.style.color = '';
        }
        window.updateCheckoutSummary();
      };
    }
  } else {
    if (loyaltyRow) loyaltyRow.remove();
  }

  const totalEl = document.getElementById('summary-total');
  if (totalEl) totalEl.textContent = formatCurrency(grandTotal);
};

function highlightError(el) {
  el.classList.add('is-invalid');
  el.focus();
  const errEl = el.parentElement.querySelector('.error-msg');
  if (errEl) {
    errEl.textContent = 'This field is required';
  }
}

// Call init on DOM ready
function initCheckoutPage() {
  initCheckoutValidation();
  renderCheckoutItems();
  window.updateCheckoutSummary();
}

document.addEventListener('DOMContentLoaded', initCheckoutPage);
if (
  document.readyState === 'interactive' ||
  document.readyState === 'complete'
) {
  initCheckoutPage();
}

window.addEventListener('couponApplied', () => {
  window.updateCheckoutSummary();
});
window.addEventListener('couponRemoved', () => {
  window.updateCheckoutSummary();
});

// ── Close popup when clicking outside the box ─────────────
const successOverlay = document.getElementById('successPopup');
if (successOverlay) {
  successOverlay.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('show');
  });
}
// Advanced validation routines checking postal formats and shipping address boundaries.