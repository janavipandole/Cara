document.addEventListener('DOMContentLoaded', async () => {
  const loadingIndicator = document.getElementById('loading-indicator');
  const imagePreview = document.getElementById('shared-image-preview');
  const resultsContainer = document.getElementById('search-results');
  const errorContainer = document.getElementById('error-message');
  
  // Check for error in URL params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error')) {
    showError();
    return;
  }

  try {
    // Attempt to read the shared image from the cache
    const cache = await caches.open('shared-image-cache');
    const cachedResponse = await cache.match('/shared-image');

    if (!cachedResponse) {
      // If there's no shared image, perhaps they navigated here directly
      // In a real app, maybe show an upload button here instead.
      throw new Error('No shared image found.');
    }

    const blob = await cachedResponse.blob();
    const objectURL = URL.createObjectURL(blob);
    
    // Display the image
    if (imagePreview) {
      imagePreview.src = objectURL;
      imagePreview.style.display = 'block';
    }
    
    // Clean up cache after retrieving
    await cache.delete('/shared-image');
    
    // Simulate visual search processing delay
    setTimeout(() => {
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      
      // We would normally upload the blob to our backend here for vector search
      // e.g., const formData = new FormData(); formData.append('image', blob);
      // await fetch('/api/visual-search', { method: 'POST', body: formData });
      
      // For now, load dummy similar products to demonstrate handoff to UI
      loadSimilarProducts();
    }, 2000);

  } catch (err) {
    // Silent fail - error shown via UI
    showError();
  }

  function showError() {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (imagePreview) imagePreview.style.display = 'none';
    if (errorContainer) errorContainer.style.display = 'block';
  }

  function loadSimilarProducts() {
    if (resultsContainer) resultsContainer.style.display = 'block';
    const productsGrid = document.getElementById('similar-products-grid');
    if (!productsGrid) return;
    
    // Mock similar products
    const mockProducts = [
      { id: 1, name: 'Floral Print Shirt', brand: 'adidas', price: 78, img: 'images/products/f1.jpg' },
      { id: 2, name: 'Floral Leaf Shirt', brand: 'adidas', price: 78, img: 'images/products/f2.jpg' },
      { id: 3, name: 'Vintage Flower Shirt', brand: 'adidas', price: 78, img: 'images/products/f3.jpg' }
    ];
    
    let html = '';
    mockProducts.forEach(p => {
      html += `
        <div class="pro" onclick="window.location.href='singleProduct.html?id=${p.id}'">
          <img src="${p.img}" alt="${p.name}">
          <div class="des">
            <span>${p.brand}</span>
            <h5>${p.name}</h5>
            <div class="star">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
            </div>
            <h4>$${p.price}</h4>
          </div>
          <a href="#"><i class="fa-solid fa-cart-shopping cart"></i></a>
        </div>
      `;
    });
    
    productsGrid.innerHTML = html;
  }
});


export function getVisualSearchStatusHelper90() {
  return { status: "ok", fn: "getVisualSearchStatusHelper90" };
}
