const modal = document.getElementById('size-chart-modal');
const PRODUCT_DETAILS_REQUEST_KEY = 'product-details';

function abortProductDetailsRequest() {
  if (window.CaraAPI && typeof window.CaraAPI.abortRequest === 'function') {
    window.CaraAPI.abortRequest(PRODUCT_DETAILS_REQUEST_KEY);
  }
}

function renderProductDetails(product) {
  const nameEl = document.getElementById('product-name');
  const priceEl = document.getElementById('product-price');
  const mainImgEl = document.getElementById('MainImg');
  const breadcrumbEl = document.querySelector('.single-pro-details h6');
  const smallImgs = document.querySelectorAll('.small-img');

  if (nameEl) nameEl.textContent = product.name;
  if (priceEl) priceEl.textContent = product.price;
  if (mainImgEl) mainImgEl.src = product.image;

  if (breadcrumbEl && product.brand) {
    let productType = 'T-Shirt';
    if (product.name.toLowerCase().includes('trousers')) {
      productType = 'Trousers';
    } else if (product.name.toLowerCase().includes('shorts')) {
      productType = 'Shorts';
    } else if (product.name.toLowerCase().includes('blouse')) {
      productType = 'Blouse';
    } else if (product.name.toLowerCase().includes('shirt')) {
      productType = 'Shirt';
    }
    breadcrumbEl.textContent = `Home / ${product.brand} / ${productType}`;
  }

  if (smallImgs.length > 0 && product.image) {
    smallImgs[0].src = product.image;
  }
}

function loadProductDetails() {
  const storedProductJSON = localStorage.getItem('selectedProduct');
  if (!storedProductJSON) return;

  try {
    const product = JSON.parse(storedProductJSON);
    if (!product) return;

    renderProductDetails({
      name: product.name || 'Product',
      price: product.price || '$0.00',
      image: product.image || 'images/products/f1.jpg',
      brand: product.brand || 'Brand',
    });

    if (
      product.id &&
      window.CaraAPI &&
      typeof window.CaraAPI.fetchData === 'function'
    ) {
      window.CaraAPI.fetchData(`/api/products/${product.id}`, {
        requestKey: PRODUCT_DETAILS_REQUEST_KEY,
        headers: {
          Accept: 'application/json',
        },
      })
        .then((apiProduct) => {
          if (!apiProduct) return;
          renderProductDetails({
            name: apiProduct.name || product.name || 'Product',
            price: apiProduct.price
              ? `₹${apiProduct.price}`
              : product.price || '$0.00',
            image: apiProduct.img || product.image || 'images/products/f1.jpg',
            brand: apiProduct.brand || product.brand || 'Brand',
          });
        })
        .catch((error) => {
          if (error && error.name !== 'AbortError') {
            console.error('Failed to load product details:', error);
          }
        });
    }
  } catch (error) {
    console.error('Error parsing stored product:', error);
  }
}

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

// PRODUCT REVIEWS LOGIC
document.addEventListener('DOMContentLoaded', () => {
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('reviewerName').value;
      const rating = document.getElementById('reviewRating').value;
      const text = document.getElementById('reviewText').value;

      if (!name || !rating || !text) return;

      const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const newReview = document.createElement('div');
      newReview.className = 'review-card fade-up';
      newReview.style.cssText = 'border: 1px solid var(--glass-2); padding: 15px; border-radius: 12px; margin-bottom: 15px; background: rgba(255,255,255,0.02);';
      newReview.innerHTML = `
        <div class="review-header" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span class="reviewer-name" style="font-weight: 700;">${name}</span>
            <span class="review-stars" style="color: #f1c40f;">${stars}</span>
        </div>
        <p class="review-text" style="color: var(--muted); margin: 0;">${text}</p>
      `;

      document.getElementById('reviewsList').appendChild(newReview);
      reviewForm.reset();

      if (typeof window.showToast === 'function') {
        window.showToast('Review submitted successfully!', 'success');
      } else {
        alert('Review submitted successfully!');
      }
    });
  }
});
