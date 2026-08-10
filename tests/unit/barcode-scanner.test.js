import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  document.body.innerHTML = '<button id="scanBarcodeBtn">Scan</button>';
  // jsdom has no BarcodeDetector; stub it so the scanner initialises.
  window.BarcodeDetector = class MockBarcodeDetector {
    static getSupportedFormats() {
      return Promise.resolve(['ean_13']);
    }
    detect() {
      return Promise.resolve([]);
    }
  };
});

async function load() {
  await import('../../js/barcode-scanner.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('barcode-scanner', () => {
  it('creates the scanner modal and wires elements on load', async () => {
    await load();
    expect(document.getElementById('barcode-scanner-modal')).toBeTruthy();
    expect(document.getElementById('barcode-video')).toBeTruthy();
    expect(document.getElementById('close-scanner-btn')).toBeTruthy();
  });

  it('shows the camera-denied status when getUserMedia is rejected', async () => {
    // Reject camera access so the module writes the denial status.
    navigator.mediaDevices = {
      getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
    };
    window.alert = vi.fn();

    await load();
    const scanBtn = document.getElementById('scanBarcodeBtn');
    scanBtn.click();

    // Flush microtasks so the catch handler in startScanner runs.
    await Promise.resolve();
    const status = document.getElementById('scanner-status');
    expect(status.textContent).toBe('Camera access denied or unavailable.');
  });

  it('writes a scan-failure status when detect rejects', async () => {
    navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
    };
    // Make the mock detector's detect reject.
    window.BarcodeDetector = class MockBarcodeDetector {
      static getSupportedFormats() {
        return Promise.resolve(['ean_13']);
      }
      detect() {
        return Promise.reject(new Error('detect failed'));
      }
    };
    // Run animation frames synchronously so scanFrame executes.
    window.requestAnimationFrame = (cb) => {
      cb();
      return 1;
    };

    await load();
    const video = document.getElementById('barcode-video');
    // scanFrame only processes frames once the video stream is ready.
    Object.defineProperty(video, 'videoWidth', { value: 640 });
    Object.defineProperty(video, 'videoHeight', { value: 480 });

    document.getElementById('scanBarcodeBtn').click();
    // Let startScanner await getUserMedia and assign the stream.
    await Promise.resolve();
    await Promise.resolve();
    // Fire onloadedmetadata to start the scan loop.
    video.dispatchEvent(new Event('loadedmetadata'));
    await Promise.resolve();
    await Promise.resolve();

    const status = document.getElementById('scanner-status');
    expect(status.textContent).toContain('Unable to read barcode');
  });

});
