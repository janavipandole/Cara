/**
 * Virtual Try-On Canvas Engine
 * Manages HTML5 Canvas rendering for virtual clothing previews, drag-and-drop overlays, scale transformation, and snapshot generation.
 */

class VirtualTryOnEngine {
  constructor(canvasElement = null) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.state = {
      modelImage: null,
      garmentImage: null,
      scale: 1.0,
      rotation: 0,
      position: { x: 0, y: 0 }
    };
  }

  setCanvas(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
  }

  updateTransform({ scale, rotation, offsetX, offsetY }) {
    if (typeof scale === 'number' && isFinite(scale)) this.state.scale = Math.max(0.2, Math.min(3.0, scale));
    if (typeof rotation === 'number' && isFinite(rotation)) {
      // Normalize to a positive angle in [0, 360).
      this.state.rotation = ((rotation % 360) + 360) % 360;
    }
    if (typeof offsetX === 'number' && isFinite(offsetX)) this.state.position.x = offsetX;
    if (typeof offsetY === 'number' && isFinite(offsetY)) this.state.position.y = offsetY;

    return { ...this.state };
  }

  calculateGarmentBounds(canvasWidth, canvasHeight, garmentWidth, garmentHeight) {
    const scaledW = garmentWidth * this.state.scale;
    const scaledH = garmentHeight * this.state.scale;

    const centerX = canvasWidth / 2 + this.state.position.x;
    const centerY = canvasHeight / 2 + this.state.position.y;

    const left = centerX - scaledW / 2;
    const top = centerY - scaledH / 2;

    return { left, top, width: scaledW, height: scaledH, centerX, centerY };
  }

  render() {
    if (!this.canvas || !this.ctx) return false;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state.modelImage) {
      this.ctx.drawImage(this.state.modelImage, 0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.state.garmentImage) {
      const bounds = this.calculateGarmentBounds(
        this.canvas.width,
        this.canvas.height,
        this.state.garmentImage.width,
        this.state.garmentImage.height
      );

      this.ctx.save();
      this.ctx.translate(bounds.centerX, bounds.centerY);
      this.ctx.rotate((this.state.rotation * Math.PI) / 180);
      this.ctx.drawImage(
        this.state.garmentImage,
        -bounds.width / 2,
        -bounds.height / 2,
        bounds.width,
        bounds.height
      );
      this.ctx.restore();
    }

    return true;
  }

  exportDataURL(type = 'image/png') {
    if (!this.canvas) return null;
    return this.canvas.toDataURL(type);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VirtualTryOnEngine;
} else {
  window.VirtualTryOnEngine = VirtualTryOnEngine;
}


export function getVirtualTryonEngineStatusHelper89() {
  return { status: "ok", fn: "getVirtualTryonEngineStatusHelper89" };
}
