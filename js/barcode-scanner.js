document.addEventListener("DOMContentLoaded", () => {
  // Check if BarcodeDetector is supported
  if (!('BarcodeDetector' in window)) {
    return;
  }

  // Ensure styles are added
  if (!document.getElementById('barcode-scanner-styles')) {
    const style = document.createElement('style');
    style.id = 'barcode-scanner-styles';
    style.innerHTML = `
      .scanner-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      .scanner-modal-content {
        position: relative;
        width: 100%;
        max-width: 500px;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .scanner-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
      }
      .scanner-header h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
      #close-scanner-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #333;
      }
      .scanner-video-container {
        position: relative;
        width: 100%;
        background: #000;
        display: flex;
        justify-content: center;
      }
      #barcode-video {
        width: 100%;
        max-height: 60vh;
        object-fit: cover;
      }
      .scanner-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70%;
        height: 50%;
        border: 2px solid #088178;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        pointer-events: none;
      }
      .scanner-status {
        text-align: center;
        padding: 15px;
        margin: 0;
        font-size: 14px;
        color: #666;
        background: #fff;
      }
      #scanBarcodeBtn {
        background: none;
        border: none;
        font-size: 20px;
        color: #088178;
        cursor: pointer;
        padding: 0 10px;
        display: flex !important;
        align-items: center;
        justify-content: center;
      }
      #scanBarcodeBtn:hover {
        color: #06665f;
      }
    `;
    document.head.appendChild(style);
  }

  // Inject modal if not present
  if (!document.getElementById('barcode-scanner-modal')) {
    const modalHTML = `
      <div id="barcode-scanner-modal" class="scanner-modal" style="display: none;">
        <div class="scanner-modal-content">
          <div class="scanner-header">
            <h3>Scan Product Barcode</h3>
            <button id="close-scanner-btn" aria-label="Close Scanner"><i class="ri-close-line"></i></button>
          </div>
          <div class="scanner-video-container">
            <video id="barcode-video" autoplay playsinline></video>
            <div class="scanner-overlay"></div>
          </div>
          <p class="scanner-status" id="scanner-status">Looking for barcode...</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const scanBtn = document.getElementById('scanBarcodeBtn');
  if (!scanBtn) return; // If button not found, do nothing (e.g., on pages without it)
  
  // Show the scan button since BarcodeDetector is supported
  scanBtn.style.display = 'flex';

  const modal = document.getElementById('barcode-scanner-modal');
  const closeBtn = document.getElementById('close-scanner-btn');
  const video = document.getElementById('barcode-video');
  const status = document.getElementById('scanner-status');
  
  let stream = null;
  let detector = null;
  let scanning = false;
  let animationFrameId = null;

  try {
    detector = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] });
  } catch (e) {
    console.error('BarcodeDetector initialization failed', e);
    return;
  }

  const startScanner = async () => {
    try {
      modal.style.display = 'flex';
      status.textContent = 'Requesting camera access...';
      
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
        video.play();
        scanning = true;
        status.textContent = 'Looking for barcode...';
        requestAnimationFrame(scanFrame);
      };
    } catch (err) {
      console.error('Error accessing camera:', err);
      status.textContent = 'Camera access denied or unavailable.';
    }
  };

  const stopScanner = () => {
    scanning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    video.srcObject = null;
    modal.style.display = 'none';
  };

  const processBarcode = async (barcodeValue) => {
    stopScanner();
    // Assuming barcodeValue matches product name or id exactly as per current app logic
    
    // Check if the barcode matches any known product in our JS mock db
    // This logic relies on `products` array being available in global scope (products.js)
    if (typeof products !== 'undefined' && Array.isArray(products)) {
      const matchedProduct = products.find(p => 
        p && p.name && p.name.toLowerCase() === barcodeValue.toLowerCase() || 
        String(p.id) === barcodeValue
      );
      
      if (matchedProduct) {
        try {
          localStorage.setItem("selectedProductId", matchedProduct.name);
        } catch (err) {
          // Ignore storage failures, navigation still works.
        }
        window.location.href = "singleProduct.html";
        return;
      }
    }
    
    // Fallback: If no exact match or products not loaded, store the value and redirect anyway
    // The PDP page handles resolving the product.
    try {
      localStorage.setItem("selectedProductId", barcodeValue);
    } catch (err) {
      // Ignore storage failures, navigation still works.
    }
    window.location.href = "singleProduct.html";
  };

  const scanFrame = async () => {
    if (!scanning || !video.videoWidth) {
      if (scanning) animationFrameId = requestAnimationFrame(scanFrame);
      return;
    }

    try {
      const barcodes = await detector.detect(video);
      if (barcodes.length > 0) {
        // Found a barcode
        const barcode = barcodes[0];
        status.textContent = `Found: ${barcode.rawValue}`;
        
        // Stop scanning and process
        processBarcode(barcode.rawValue);
        return;
      }
    } catch (err) {
      // Surface repeated detection failures instead of silently retrying.
      status.textContent = 'Unable to read barcode. Try again.';
      scanning = false;
      return;
    }

    if (scanning) {
      animationFrameId = requestAnimationFrame(scanFrame);
    }
  };

  scanBtn.addEventListener('click', (e) => {
    e.preventDefault();
    startScanner();
  });

  closeBtn.addEventListener('click', stopScanner);
  
  // Close when clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      stopScanner();
    }
  });
});
