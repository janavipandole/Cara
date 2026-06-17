const modal = document.getElementById('size-chart-modal');

const openBtn = document.getElementById('size-chart-btn');

const closeBtn = document.querySelector('.close-btn');

const sizeDropdown = document.getElementById('product-size');

const sizeRadios = document.querySelectorAll('.size-chart input[type="radio"]');

// OPEN MODAL

if (openBtn && modal)
  openBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

// CLOSE MODAL

if (closeBtn)
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

// CLOSE WHEN CLICKING OUTSIDE

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// AUTO SELECT SIZE + CLOSE MODAL

sizeRadios.forEach((radio) => {
  radio.addEventListener('change', function () {
    // Get selected row
    const row = this.closest('tr');

    // Get size text
    const selectedSize = row.children[1].textContent.trim();

    // Update dropdown
    sizeDropdown.value = selectedSize;

    // Close modal
    modal.style.display = 'none';
  });
});

// OVERRIDE ADD TO CART AND BUY NOW FOR SIZE VALIDATION
if (sizeDropdown) {
  const originalAddToCart = window.handleAddToCart;
  window.handleAddToCart = function () {
    if (sizeDropdown.value === 'Select Size' || sizeDropdown.value === '') {
      sizeDropdown.style.border = '2px solid #ef4444';
      sizeDropdown.style.borderRadius = '4px';

      let errLabel = document.getElementById('size-error-label');
      if (!errLabel) {
        errLabel = document.createElement('span');
        errLabel.id = 'size-error-label';
        errLabel.style.cssText =
          'color:#ef4444; font-size:12px; font-weight:700; display:block; margin-top:5px;';
        errLabel.textContent = 'Please select a size before adding to cart!';
        sizeDropdown.parentNode.appendChild(errLabel);
      }
      if (typeof showToast === 'function') {
        showToast('Please select a size before adding to cart!', 'warning');
      }
      return;
    }
    if (originalAddToCart) originalAddToCart();
  };

  const originalBuyNow = window.handleBuyNow;
  window.handleBuyNow = function () {
    if (sizeDropdown.value === 'Select Size' || sizeDropdown.value === '') {
      sizeDropdown.style.border = '2px solid #ef4444';
      sizeDropdown.style.borderRadius = '4px';

      let errLabel = document.getElementById('size-error-label');
      if (!errLabel) {
        errLabel = document.createElement('span');
        errLabel.id = 'size-error-label';
        errLabel.style.cssText =
          'color:#ef4444; font-size:12px; font-weight:700; display:block; margin-top:5px;';
        errLabel.textContent = 'Please select a size before proceeding!';
        sizeDropdown.parentNode.appendChild(errLabel);
      }
      if (typeof showToast === 'function') {
        showToast('Please select a size before proceeding!', 'warning');
      }
      return;
    }
    if (originalBuyNow) originalBuyNow();
  };

  sizeDropdown.addEventListener('change', () => {
    if (sizeDropdown.value !== 'Select Size' && sizeDropdown.value !== '') {
      sizeDropdown.style.border = '';
      const errLabel = document.getElementById('size-error-label');
      if (errLabel) errLabel.remove();
    }
  });
}
