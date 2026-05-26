const paymentMethod = document.getElementById('paymentMethod');
const cardDetails = document.getElementById('cardDetails');

const cardName = document.getElementById('cardName');
const cardNumber = document.getElementById('cardNumber');
const expiry = document.getElementById('expiry');
const cvv = document.getElementById('cvv');
const paymentFields = [cardName, cardNumber, expiry, cvv];

function setFieldError(field, message) {
  if (!field) return;

  field.classList.add('input-error');
  field.setCustomValidity(message);
  field.reportValidity();
}

function clearFieldError(field) {
  if (!field) return;

  field.classList.remove('input-error');
  field.setCustomValidity('');
}

function getDigits(value) {
  return value.replace(/\D/g, '');
}

function formatCardNumber(value) {
  return getDigits(value)
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value) {
  const digits = getDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return digits.slice(0, 2) + '/' + digits.slice(2);
}

function isValidExpiry(value) {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number('20' + match[2]);
  if (month < 1 || month > 12) return false;

  const currentDate = new Date();
  const expiryDate = new Date(year, month);

  return expiryDate > currentDate;
}

function validateOnlinePayment() {
  if (paymentMethod.value !== 'online') return true;

  paymentFields.forEach(clearFieldError);

  const cardNumberDigits = getDigits(cardNumber.value);
  const cvvDigits = getDigits(cvv.value);

  if (cardName.value.trim().length < 2) {
    setFieldError(cardName, 'Enter the card holder name.');
    return false;
  }

  if (cardNumberDigits.length !== 16) {
    setFieldError(cardNumber, 'Enter a valid 16-digit card number.');
    return false;
  }

  if (!isValidExpiry(expiry.value.trim())) {
    setFieldError(expiry, 'Enter a valid future expiry date in MM/YY format.');
    return false;
  }

  if (!/^\d{3,4}$/.test(cvvDigits)) {
    setFieldError(cvv, 'Enter a valid 3 or 4 digit CVV.');
    return false;
  }

  return true;
}

cardNumber.addEventListener('input', function () {
  this.value = formatCardNumber(this.value);
  clearFieldError(this);
});

expiry.addEventListener('input', function () {
  this.value = formatExpiry(this.value);
  clearFieldError(this);
});

cvv.addEventListener('input', function () {
  this.value = getDigits(this.value).slice(0, 4);
  clearFieldError(this);
});

cardName.addEventListener('input', function () {
  clearFieldError(this);
});

// SHOW / HIDE CARD DETAILS
paymentMethod.addEventListener('change', function () {
  paymentFields.forEach(clearFieldError);

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
    paymentFields.forEach(function (field) {
      field.value = '';
    });
  }
});

// FORM SUBMIT
const form = document.getElementById('checkoutForm');
const popup = document.getElementById('successPopup');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  // GET CART
  let cart = JSON.parse(localStorage.getItem('productsInCart')) || [];

  // CHECK EMPTY CART
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  if (!validateOnlinePayment()) {
    return;
  }

  // ── Loading state: disable button & show spinner ──
  const submitBtn = form.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
  }

  // Simulate async order processing (replace with real API call)
  setTimeout(function () {
    // CLEAR CART AFTER SUCCESSFUL ORDER
    localStorage.removeItem('productsInCart');
    localStorage.removeItem('appliedCoupon');
    // Re-enable button
    if (submitBtn) {
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }

    // SHOW SUCCESS POPUP
    popup.classList.add('active');

    form.reset();

    // HIDE CARD DETAILS AGAIN
    cardDetails.style.display = 'none';
  }, 1500);
});

function closePopup() {
  popup.classList.remove('active');
}
