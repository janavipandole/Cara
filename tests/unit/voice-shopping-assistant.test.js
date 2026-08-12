import { describe, it, expect, vi } from 'vitest';

const { parseVoiceIntent, parseVoiceIntentAsync, isVoiceSupported, VoiceShoppingAssistant } = window.VoiceShoppingAssistant;

describe('voice-shopping-assistant', () => {
  describe('parseVoiceIntent', () => {
    it('returns an object with expected keys', () => {
      const result = parseVoiceIntent('hello');
      expect(result).toHaveProperty('rawText');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('maxPrice');
      expect(result).toHaveProperty('targetUrl');
    });

    it('parses navigate-to-cart intent', () => {
      const result = parseVoiceIntent('go to cart');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('cart.html');
    });

    it('parses navigate-to-shop intent', () => {
      const result = parseVoiceIntent('navigate to shop');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('shop.html');
    });

    it('parses navigate-to-home intent', () => {
      const result = parseVoiceIntent('open homepage');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('index.html');
    });

    it('parses search intent by default', () => {
      const result = parseVoiceIntent('show me blue shirts');
      expect(result.action).toBe('search');
      expect(result.query.length).toBeGreaterThan(0);
    });

    it('extracts color from transcript', () => {
      const result = parseVoiceIntent('find red shoes');
      expect(result.color).toBe('red');
    });

    it('extracts maxPrice with under keyword', () => {
      const result = parseVoiceIntent('find something under 50 dollars');
      expect(result.maxPrice).toBe(50);
    });

    it('extracts maxPrice with below keyword', () => {
      const result = parseVoiceIntent('items below 100');
      expect(result.maxPrice).toBe(100);
    });

    it('returns null maxPrice when no price mentioned', () => {
      const result = parseVoiceIntent('show me shirts');
      expect(result.maxPrice).toBeNull();
    });
  });

  describe('parseVoiceIntentAsync', () => {
    it('returns a Promise', () => {
      const result = parseVoiceIntentAsync('hello');
      expect(result).toBeInstanceOf(Promise);
    });

    it('resolves to a valid intent object', async () => {
      const result = await parseVoiceIntentAsync('go to cart');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('cart.html');
    });
  });

  describe('isVoiceSupported', () => {
    it('returns a boolean', () => {
      const result = isVoiceSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('VoiceShoppingAssistant constructor', () => {
    it('creates instance with onResult callback', () => {
      const onResult = vi.fn();
      const ws = new VoiceShoppingAssistant({ onResult });
      expect(ws.onResultCallback).toBe(onResult);
      expect(ws.isListening).toBe(false);
    });
  });
});
