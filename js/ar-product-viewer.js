/**
 * AR WebXR 3D Interactive Product Viewer with Spatial Anchoring
 * 
 * Enables 3D product model viewing, 360-degree rotation, texture color swapping,
 * and WebXR spatial AR placement ("View in Your Space") on mobile devices.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ARProductViewer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isARSupported() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    const isWebXR =
      navigator.xr &&
      typeof navigator.xr.isSessionSupported === 'function';

    const isiOSAR =
      typeof document !== 'undefined' &&
      (() => {
        try {
          const a = document.createElement('a');
          return a.relList && a.relList.supports && a.relList.supports('ar');
        } catch (err) {
          console.warn('[AR Viewer] relList AR support check failed:', err);
          return false;
        }
      })();

    return Boolean(isWebXR || isiOSAR || window.customElements?.get('model-viewer'));
  }

  class ARProductViewer {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.modelSrc = options.modelSrc || 'assets/models/default_product.glb';
      this.usdzSrc = options.usdzSrc || 'assets/models/default_product.usdz';
      this.altText = options.altText || '3D Product Model';
      this.currentColor = options.initialColor || '#088178';
      this.rotationDeg = 0;
      this.isDragging = false;
      this.startX = 0;

      if (this.container) {
        this.init();
      }
    }

    init() {
      this.container.innerHTML = '';
      this.viewerEl = document.createElement('div');
      this.viewerEl.className = 'ar-product-viewer-box';

      // Check if <model-viewer> is available, else create interactive 3D canvas container
      if (window.customElements && window.customElements.get('model-viewer')) {
        this.renderModelViewer();
      } else {
        this.renderCanvasViewer();
      }

      this.container.appendChild(this.viewerEl);
    }

    renderModelViewer() {
      this.viewerEl.innerHTML = `
        <model-viewer 
          src="${this.modelSrc}" 
          ios-src="${this.usdzSrc}"
          alt="${this.altText}" 
          ar 
          ar-modes="webxr scene-viewer quick-look" 
          camera-controls 
          auto-rotate 
          shadow-intensity="1"
          style="width: 100%; height: 400px; background-color: var(--bg-secondary); border-radius: 12px;"
        >
          <button slot="ar-button" class="ar-view-btn">
            <i class="ri-camera-lens-line"></i> View in Your Space (AR)
          </button>
        </model-viewer>
        <div class="ar-controls-bar">
          <label>Variant Color:</label>
          <input type="color" class="ar-color-picker" value="${this.currentColor}" aria-label="Change product 3D texture color">
        </div>
      `;

      const colorPicker = this.viewerEl.querySelector('.ar-color-picker');
      if (colorPicker) {
        colorPicker.addEventListener('input', (e) => this.setProductColor(e.target.value));
      }
    }

    renderCanvasViewer() {
      this.viewerEl.innerHTML = `
        <div class="canvas-3d-wrapper" style="position: relative; width: 100%; height: 400px; background: var(--bg-secondary); border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <canvas class="canvas-3d-preview" width="400" height="400" style="width: 100%; height: 100%;"></canvas>
          <div class="ar-badge-container" style="position: absolute; bottom: 15px; left: 15px; display: flex; gap: 10px;">
            <button type="button" class="ar-trigger-btn" style="background: var(--accent); color: white; border: none; padding: 10px 16px; border-radius: 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <i class="ri-scan-2-line"></i> View in Your Space (AR)
            </button>
          </div>
          <div class="rotate-hint" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px;">
            <i class="ri-drag-move-fill"></i> Drag to rotate 360°
          </div>
        </div>
      `;

      this.canvas = this.viewerEl.querySelector('.canvas-3d-preview');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.drawMock3DProduct();
      this.bindDragControls();

      const arBtn = this.viewerEl.querySelector('.ar-trigger-btn');
      if (arBtn) {
        arBtn.addEventListener('click', () => this.triggerARSession());
      }
    }

    drawMock3DProduct() {
      if (!this.ctx) return;
      const width = this.canvas.width;
      const height = this.canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      this.ctx.clearRect(0, 0, width, height);

      // Render simulated 3D model rotation perspective
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      const scaleX = Math.cos((this.rotationDeg * Math.PI) / 180);

      // Draw product 3D shadow
      this.ctx.beginPath();
      this.ctx.ellipse(0, 120, 100 * Math.abs(scaleX) + 20, 30, 0, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.fill();

      // Draw simulated 3D garment / object geometry
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 80 * scaleX, 110, 0, 0, 2 * Math.PI);
      this.ctx.fillStyle = this.currentColor;
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Draw highlights/texture details
      this.ctx.beginPath();
      this.ctx.ellipse(-20 * scaleX, -30, 20 * scaleX, 40, 0, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.fill();

      this.ctx.restore();
    }

    bindDragControls() {
      const wrapper = this.viewerEl.querySelector('.canvas-3d-wrapper');
      if (!wrapper) return;

      const onStart = (x) => {
        this.isDragging = true;
        this.startX = x;
        wrapper.style.cursor = 'grabbing';
      };

      const onMove = (x) => {
        if (!this.isDragging) return;
        const deltaX = x - this.startX;
        this.rotationDeg = (this.rotationDeg + deltaX * 0.5) % 360;
        this.startX = x;
        this.drawMock3DProduct();
      };

      const onEnd = () => {
        this.isDragging = false;
        wrapper.style.cursor = 'grab';
      };

      wrapper.addEventListener('mousedown', (e) => onStart(e.clientX));
      window.addEventListener('mousemove', (e) => onMove(e.clientX));
      window.addEventListener('mouseup', onEnd);

      wrapper.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX));
      wrapper.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX));
      wrapper.addEventListener('touchend', onEnd);
    }

    setProductColor(color) {
      this.currentColor = color;
      const modelViewer = this.viewerEl.querySelector('model-viewer');
      if (modelViewer && modelViewer.model) {
        const material = modelViewer.model.materials[0];
        if (material) {
          material.pbrMetallicRoughness.setBaseColorFactor(this.hexToRgb(color));
        }
      } else {
        this.drawMock3DProduct();
      }
    }

    triggerARSession() {
      if (isARSupported()) {
        const arAnchor = document.createElement('a');
        arAnchor.rel = 'ar';
        arAnchor.href = this.usdzSrc;
        arAnchor.appendChild(document.createElement('img'));
        arAnchor.click();
      } else {
        alert('AR Spatial placement requires a mobile device with ARKit (iOS) or ARCore (Android). Showing 360° desktop interactive mode.');
      }
    }

    hexToRgb(hex) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map((x) => x + x).join('');
      const num = parseInt(c, 16);
      return [
        ((num >> 16) & 255) / 255,
        ((num >> 8) & 255) / 255,
        (num & 255) / 255,
        1.0,
      ];
    }
  }

  return {
    ARProductViewer,
    isARSupported,
  };
});
