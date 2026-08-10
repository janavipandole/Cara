import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('VoiceShoppingAssistant Unit Tests', () => {
  let VoiceShoppingAssistant;
  let parseVoiceIntent;
  let isVoiceSupported;
  let speakResponse;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<input type="search" id="search-input" />';
    const module = await import('../../js/voice-shopping-assistant.js');
    const exports = module.default || window.VoiceShoppingAssistant;
    VoiceShoppingAssistant = exports.VoiceShoppingAssistant;
    parseVoiceIntent = exports.parseVoiceIntent;
    isVoiceSupported = exports.isVoiceSupported;
    speakResponse = exports.speakResponse;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly checks Web Speech API support', () => {
    expect(typeof isVoiceSupported()).toBe('boolean');
  });

  it('parses natural language voice query for search intent', () => {
    const intent = parseVoiceIntent('Show me black formal shoes under 50 dollars');

    expect(intent.action).toBe('search');
    expect(intent.color).toBe('black');
    expect(intent.category).toBe('formal');
    expect(intent.maxPrice).toBe(50);
  });

  it('parses navigation intents for cart and shop pages', () => {
    const cartIntent = parseVoiceIntent('Go to cart');
    expect(cartIntent.action).toBe('navigate');
    expect(cartIntent.targetUrl).toBe('cart.html');

    const shopIntent = parseVoiceIntent('Navigate to shop');
    expect(shopIntent.action).toBe('navigate');
    expect(shopIntent.targetUrl).toBe('shop.html');
  });

  it('executes SpeechSynthesis text-to-speech without throwing errors', () => {
    window.speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
    };
    window.SpeechSynthesisUtterance = vi.fn();

    expect(() => speakResponse('Test voice response')).not.toThrow();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });
});
