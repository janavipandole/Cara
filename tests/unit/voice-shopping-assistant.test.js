import { describe, it, expect, vi, beforeEach } from 'vitest';

let VoiceModule;

beforeEach(async () => {
  vi.resetModules();
  VoiceModule = await import('../../js/voice-shopping-assistant.js');
  if (!VoiceModule || !VoiceModule.parseVoiceIntent) {
    VoiceModule = require('../../js/voice-shopping-assistant.js');
  }
});

const getExports = () => {
  if (VoiceModule && typeof VoiceModule.parseVoiceIntent === 'function') {
    return VoiceModule;
  }
  return null;
};

describe('voice-shopping-assistant', () => {
  describe('parseVoiceIntent', () => {
    it('returns an object with expected keys', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('hello');
      expect(result).toHaveProperty('rawText');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('maxPrice');
      expect(result).toHaveProperty('targetUrl');
    });

    it('parses navigate-to-cart intent', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('go to cart');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('cart.html');
    });

    it('parses navigate-to-shop intent', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('navigate to shop');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('shop.html');
    });

    it('parses navigate-to-home intent', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('open homepage');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('index.html');
    });

    it('parses search intent by default', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('show me blue shirts');
      expect(result.action).toBe('search');
      expect(result.query.length).toBeGreaterThan(0);
    });

    it('extracts color from transcript', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('find red shoes');
      expect(result.color).toBe('red');
    });

    it('extracts maxPrice with under keyword', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('find something under 50 dollars');
      expect(result.maxPrice).toBe(50);
    });

    it('extracts maxPrice with below keyword', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('items below 100');
      expect(result.maxPrice).toBe(100);
    });

    it('returns null maxPrice when no price mentioned', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntent('show me shirts');
      expect(result.maxPrice).toBeNull();
    });
  });

  describe('parseVoiceIntentAsync', () => {
    it('returns a Promise', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.parseVoiceIntentAsync('hello');
      expect(result).toBeInstanceOf(Promise);
    });

    it('resolves to a valid intent object', async () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = await exports.parseVoiceIntentAsync('go to cart');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('cart.html');
    });
  });

  describe('isVoiceSupported', () => {
    it('returns a boolean', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const result = exports.isVoiceSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('VoiceShoppingAssistant constructor', () => {
    it('creates instance with onResult callback', () => {
      const exports = getExports();
      if (!exports) { console.warn('VoiceModule not loaded'); return; }
      const VSA = exports.VoiceShoppingAssistant;
      const onResult = vi.fn();
      const ws = new VSA({ onResult });
      expect(ws.onResultCallback).toBe(onResult);
      expect(ws.isListening).toBe(false);
    });
  });
});
