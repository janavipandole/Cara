function loadFooter() {
  const footerHTML = `
    <!-- Newsletter Section -->
    <section id="newsletter" class="section-p1">
      <div class="newstext">
        <h4>Sign Up For Newsletters</h4>
        <p>Get E-mail updates about our latest shop and 
          <span>special offers.</span>
        </p>
      </div>
      <form class="form newsletter-form" id="newsletterForm">
        <input type="email" placeholder="Your email address" required />
        <button type="submit" class="normal">Sign Up</button>
      </form>
    </section>

    <!-- Main Footer -->
    <footer class="section-p1">
      <div class="footer-container">

        <!-- Contact Column -->
        <div class="col">
          <img class="logo" src="images/logo.png" alt="Cara Logo" />
          <h4>Contact</h4>
          <p><strong>Address:</strong> 562 Wellington Road, 
            Street 32, San Francisco</p>
          <p><strong>Phone:</strong> +01 2222 365 / 
            (+91) 01 2345 6789</p>
          <p><strong>Hours:</strong> 10:00 - 18:00, Mon - Sat</p>

          <div class="follow">
            <h4>Follow us</h4>
            <div class="icon">
              <a href="https://x.com/JanaviPandole" 
                target="_blank" rel="noopener noreferrer"
                aria-label="Twitter">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="https://github.com/janavipandole" 
                target="_blank" rel="noopener noreferrer"
                aria-label="GitHub">
                <i class="fab fa-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/janavi-pandole-80a7b2290" 
                target="_blank" rel="noopener noreferrer"
                aria-label="LinkedIn">
                <i class="fab fa-linkedin"></i>
              </a>
              <a href="https://www.youtube.com/@JanaviPandole" 
                target="_blank" rel="noopener noreferrer"
                aria-label="YouTube">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- About Column -->
        <div class="col">
          <h4>About</h4>
          <a href="about.html">About us</a>
          <a href="#">Delivery Information</a>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms & Conditions</a>
          <a href="contact.html">Contact Us</a>
        </div>

        <!-- My Account Column -->
        <div class="col">
          <h4>My Account</h4>
          <a href="login.html">Sign In</a>
          <a href="cart.html">View Cart</a>
          <a href="#">My Wishlist</a>
          <a href="track-order.html">Track My Order</a>
          <a href="contact.html">Help</a>
        </div>

        <!-- Install App Column -->
        <div class="col install">
          <h4>Install App</h4>
          <p>From App Store or Google Play</p>
          <div class="row">
            <img src="images/pay/app.jpg" 
              alt="Download from App Store" />
            <img src="images/pay/play.jpg" 
              alt="Get it on Google Play" />
          </div>
          <p>Secured Payment Gateways</p>
          <div class="payment-icons">
            <a href="https://www.visa.com" target="_blank" 
              rel="noopener noreferrer" aria-label="Visa">
              <i class="fab fa-cc-visa"></i>
            </a>
            <a href="https://www.mastercard.com" target="_blank" 
              rel="noopener noreferrer" aria-label="Mastercard">
              <i class="fab fa-cc-mastercard"></i>
            </a>
            <a href="https://www.paypal.com" target="_blank" 
              rel="noopener noreferrer" aria-label="PayPal">
              <i class="fab fa-cc-paypal"></i>
            </a>
            <a href="https://www.americanexpress.com" target="_blank" 
              rel="noopener noreferrer" aria-label="American Express">
              <i class="fab fa-cc-amex"></i>
            </a>
            <a href="https://stripe.com" target="_blank" 
              rel="noopener noreferrer" aria-label="Stripe">
              <i class="fab fa-cc-stripe"></i>
            </a>
          </div>
        </div>

      </div>

      <!-- Copyright -->
      <div class="copyright">
        <p>
          &copy; Cara 2025. All rights reserved. |
          <a href="license.html" style="color: #088178">
            MIT License
          </a>
        </p>
      </div>
    </footer>
  `;

  // Load footer into container
  const container = document.getElementById('footer-container');
  if (container) {
    container.innerHTML = footerHTML;
    initNewsletter();
  } else {
    console.error('footer-container not found!');
  }
}

// Newsletter form handler
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      if (email) {
        // Show success message
        showToast('success', '✅', 
          'Thank you for subscribing!');
        form.reset();
      }
    });
  }
}