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

// --- Size Conversion Integration ---

document.addEventListener('DOMContentLoaded', () => {
  const sizeRegion = document.getElementById('size-region');
  const sizeDropdown = document.getElementById('product-size');

  if (sizeRegion && sizeDropdown && typeof SizeConverter !== 'undefined') {
    // Update sizes on region change
    sizeRegion.addEventListener('change', () => {
      const region = sizeRegion.value;
      const newSizes = SizeConverter.getSizesForSystem(region);

      // Preserve the first option ("Select Size")
      sizeDropdown.innerHTML = '<option>Select Size</option>';
      newSizes.forEach((size) => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeDropdown.appendChild(option);
      });

      // Also update size chart modal dynamically
      updateSizeChart(region, newSizes);
    });
  }

  function updateSizeChart(region, sizes) {
    const tableBody = document.querySelector('.size-chart tbody');
    if (!tableBody) return;

    // Simple mock update for chest/length based on index
    const baseChest = [30.0, 32.0, 34.0, 36.0, 38.0];
    const baseLength = [21.8, 21.9, 22.0, 22.1, 22.2];

    tableBody.innerHTML = '';
    sizes.forEach((size, idx) => {
      if (idx >= baseChest.length) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${size}</td>
        <td>${baseChest[idx]}</td>
        <td>${baseLength[idx]}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Find My Size Modal Logic
  const findSizeBtn = document.getElementById('find-my-size-btn');
  const findSizeModal = document.getElementById('find-size-modal');
  const findSizeCloseBtn = document.querySelector('.find-size-close-btn');
  const findSizeForm = document.getElementById('find-size-form');

  if (findSizeBtn && findSizeModal) {
    findSizeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      findSizeModal.style.display = 'flex';
    });
  }

  if (findSizeCloseBtn && findSizeModal) {
    findSizeCloseBtn.addEventListener('click', () => {
      findSizeModal.style.display = 'none';
    });
  }

  // Close if click outside (we already have a global window click handler above, but this adds specifically for findSizeModal)
  window.addEventListener('click', (e) => {
    if (e.target === findSizeModal) {
      findSizeModal.style.display = 'none';
    }
  });

  if (findSizeForm && typeof SizeConverter !== 'undefined') {
    findSizeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const height = parseFloat(document.getElementById('user-height').value);
      const weight = parseFloat(document.getElementById('user-weight').value);
      const fit = document.getElementById('fit-pref').value;

      const rec = SizeConverter.recommendSize(height, weight, fit);

      const region = sizeRegion ? sizeRegion.value : 'US';
      const sizes = SizeConverter.getSizesForSystem(region);

      const recommendedSizeLabel =
        sizes[Math.min(rec.internalIndex, sizes.length - 1)];

      const resultDiv = document.getElementById('size-recommendation-result');
      document.getElementById('rec-size-value').textContent =
        recommendedSizeLabel;
      document.getElementById('rec-confidence').textContent = rec.confidence;
      resultDiv.style.display = 'block';

      // Pre-select the recommended size in the dropdown
      if (sizeDropdown) {
        sizeDropdown.value = recommendedSizeLabel;
        sizeDropdown.style.border = '';
        const errLabel = document.getElementById('size-error-label');
        if (errLabel) errLabel.remove();
      }
    });
  }

  // Feedback Logic after Add to Cart / Buy Now
  const fbContainer = document.getElementById('size-feedback-container');
  const fbSizeLabel = document.getElementById('feedback-purchased-size');
  const fbGoodBtn = document.getElementById('feedback-good-btn');
  const fbBadBtn = document.getElementById('feedback-bad-btn');
  const fbThanks = document.getElementById('feedback-thanks');

  function showFeedback(sizeVal) {
    if (fbContainer && fbSizeLabel) {
      fbSizeLabel.textContent = sizeVal;
      fbContainer.style.display = 'block';
      fbThanks.style.display = 'none';
      if (fbGoodBtn) fbGoodBtn.style.display = 'inline-block';
      if (fbBadBtn) fbBadBtn.style.display = 'inline-block';
    }
  }

  function handleFeedback(fitsWell) {
    const productName =
      document.getElementById('product-name')?.textContent || 'Unknown Product';
    const purchasedSize = fbSizeLabel?.textContent || 'Unknown Size';
    if (typeof SizeConverter !== 'undefined') {
      SizeConverter.trackFeedback(productName, purchasedSize, fitsWell);
    }

    if (fbGoodBtn) fbGoodBtn.style.display = 'none';
    if (fbBadBtn) fbBadBtn.style.display = 'none';
    if (fbThanks) fbThanks.style.display = 'block';
  }

  if (fbGoodBtn)
    fbGoodBtn.addEventListener('click', () => handleFeedback(true));
  if (fbBadBtn) fbBadBtn.addEventListener('click', () => handleFeedback(false));

  // Override the overrides to also show feedback
  if (sizeDropdown) {
    const origAddToCart = window.handleAddToCart;
    window.handleAddToCart = function () {
      if (origAddToCart) origAddToCart();
      // If validation passed and size is selected
      if (sizeDropdown.value !== 'Select Size' && sizeDropdown.value !== '') {
        showFeedback(sizeDropdown.value);
      }
    };

    const origBuyNow = window.handleBuyNow;
    window.handleBuyNow = function () {
      if (origBuyNow) origBuyNow();
      if (sizeDropdown.value !== 'Select Size' && sizeDropdown.value !== '') {
        showFeedback(sizeDropdown.value);
      }
    };
  }
});
