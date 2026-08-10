/**
 * mock-payment.js
 * Simulates a payment gateway integration for the checkout process.
 */

class MockPaymentGateway {
  constructor(formElementId) {
    this.form = document.getElementById(formElementId);
    this.isProcessing = false;
    this.init();
  }

  init() {
    if (!this.form) return;
    
    // Inject Mock UI
    const paymentContainer = document.createElement('div');
    paymentContainer.className = 'mock-payment-container';
    paymentContainer.innerHTML = `
      <h4>Secure Payment</h4>
      <div class="card-input-wrapper">
        <label>Card Number</label>
        <input type="text" id="mock-card-number" placeholder="**** **** **** ****" maxlength="19" required>
      </div>
      <div class="card-details">
        <div class="card-expiry">
          <label>Expiry (MM/YY)</label>
          <input type="text" id="mock-card-expiry" placeholder="MM/YY" maxlength="5" required>
        </div>
        <div class="card-cvv">
          <label>CVV</label>
          <input type="password" id="mock-card-cvv" placeholder="***" maxlength="3" required>
        </div>
      </div>
      <div class="payment-errors" id="mock-payment-errors" style="color: red; display: none; margin-top: 10px;"></div>
      <button type="submit" id="mock-payment-btn" class="normal">Pay Now</button>
    `;
    
    // Append to form, replacing the default submit button if any
    const existingSubmit = this.form.querySelector('button[type="submit"]');
    if (existingSubmit) {
      existingSubmit.style.display = 'none';
    }
    
    this.form.appendChild(paymentContainer);
    this.form.addEventListener('submit', (e) => this.processPayment(e));
  }

  processPayment(e) {
    e.preventDefault();
    if (this.isProcessing) return;
    
    const errorContainer = document.getElementById('mock-payment-errors');
    errorContainer.style.display = 'none';
    
    const cardNum = document.getElementById('mock-card-number').value.replace(/\s+/g, '');
    if (cardNum.length < 15) {
      errorContainer.textContent = 'Invalid Card Number';
      errorContainer.style.display = 'block';
      return;
    }
    
    this.setProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
      this.setProcessing(false);
      
      // Simulate success (90% chance)
      if (Math.random() > 0.1) {
        alert('Payment successful! Your order has been placed.');
        localStorage.removeItem('cartItems'); // clear cart
        window.location.href = 'index.html';
      } else {
        errorContainer.textContent = 'Payment declined by issuer. Please try again.';
        errorContainer.style.display = 'block';
      }
    }, 2500);
  }

  setProcessing(isProcessing) {
    this.isProcessing = isProcessing;
    const btn = document.getElementById('mock-payment-btn');
    if (isProcessing) {
      btn.textContent = 'Processing...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    } else {
      btn.textContent = 'Pay Now';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
}

// Initialize on DOM Load if on checkout page
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('checkout.html')) {
    new MockPaymentGateway('checkout-form');
  }
});
