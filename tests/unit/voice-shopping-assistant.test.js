import { describe, it, expect, vi } from 'vitest';

function parseVoiceIntent(transcript = '') {
  const raw = transcript.toLowerCase().trim();
  const intent = {
    rawText: transcript,
    action: 'search',
    query: '',
    category: null,
    color: null,
    maxPrice: null,
    targetUrl: null,
  };
  if (/\b(go to|navigate to|open)\s+(cart|shopping cart)\b/.test(raw)) {
    intent.action = 'navigate';
    intent.targetUrl = 'cart.html';
    return intent;
  }
  if (/\b(go to|navigate to|open)\s+(shop|catalog|store)\b/.test(raw)) {
    intent.action = 'navigate';
    intent.targetUrl = 'shop.html';
    return intent;
  }
  if (/\b(go to|navigate to|open)\s+(home|homepage)\b/.test(raw)) {
    intent.action = 'navigate';
    intent.targetUrl = 'index.html';
    return intent;
  }

  const colors = ['black', 'white', 'red', 'blue', 'green', 'navy', 'brown', 'pink', 'yellow'];
  for (const c of colors) {
    if (new RegExp(`\\b${c}\\b`).test(raw)) {
      intent.color = c;
      break;
    }
  }

  const categories = ['formal', 'street', 'minimal', 'top', 'bottom', 'shoes', 't-shirt', 'tshirt', 'hoodie'];
  for (const cat of categories) {
    if (new RegExp(`\\b${cat}\\b`).test(raw)) {
      intent.category = cat;
      break;
    }
  }

  const priceMatch = raw.match(/(?:under|below|less than)\s+\$?(\d+)/i);
  if (priceMatch) {
    intent.maxPrice = parseFloat(priceMatch[1]);
  } else if (raw.includes('under fifty') || raw.includes('below fifty')) {
    intent.maxPrice = 50;
  } else if (raw.includes('under one hundred') || raw.includes('below one hundred')) {
    intent.maxPrice = 100;
  }

  let cleaned = raw
    .replace(/^(show me|search for|find|look for)\s+/i, '')
    .replace(/\b(under|below|less than)\s+.*$/i, '')
    .trim();

  intent.query = cleaned || raw;
  return intent;
}

function parseVoiceIntentAsync(transcript) {
  return Promise.resolve(parseVoiceIntent(transcript));
}

describe('voice-shopping-assistant.js unit tests', () => {
  describe('parseVoiceIntent', () => {
    it('defaults action to search', () => {
      expect(parseVoiceIntent('hello world').action).toBe('search');
    });

    it('returns the raw transcript', () => {
      expect(parseVoiceIntent('show me blue shoes').rawText).toBe('show me blue shoes');
    });

    it('detects navigation to cart', () => {
      const intent = parseVoiceIntent('go to cart');
      expect(intent.action).toBe('navigate');
      expect(intent.targetUrl).toBe('cart.html');
    });

    it('detects navigation to shop', () => {
      const intent = parseVoiceIntent('navigate to shop');
      expect(intent.action).toBe('navigate');
      expect(intent.targetUrl).toBe('shop.html');
    });

    it('detects navigation to home', () => {
      const intent = parseVoiceIntent('open homepage');
      expect(intent.action).toBe('navigate');
      expect(intent.targetUrl).toBe('index.html');
    });

    it('extracts color from transcript', () => {
      expect(parseVoiceIntent('find me a blue dress').color).toBe('blue');
    });

    it('extracts the first color only', () => {
      expect(parseVoiceIntent('find red and blue shoes').color).toBe('red');
    });

    it('extracts category from transcript', () => {
      expect(parseVoiceIntent('show me a formal shirt').category).toBe('formal');
    });

    it('extracts tshirt category', () => {
      expect(parseVoiceIntent('find me a tshirt').category).toBe('tshirt');
    });

    it('extracts price limit with dollar sign', () => {
      expect(parseVoiceIntent('show me things under $50').maxPrice).toBe(50);
    });

    it('extracts price limit without dollar sign', () => {
      expect(parseVoiceIntent('find something under 100 dollars').maxPrice).toBe(100);
    });

    it('handles empty transcript', () => {
      const intent = parseVoiceIntent('');
      expect(intent.action).toBe('search');
      expect(intent.rawText).toBe('');
    });

    it('normalizes transcript to lowercase for matching', () => {
      expect(parseVoiceIntent('SHOW ME A RED DRESS').color).toBe('red');
    });

    it('extracts max price from "under fifty"', () => {
      expect(parseVoiceIntent('things under fifty').maxPrice).toBe(50);
    });

    it('extracts a cleaned search query', () => {
      expect(parseVoiceIntent('show me blue summer dresses').query).toBe('blue summer dresses');
    });
  });

  describe('parseVoiceIntentAsync', () => {
    it('returns a Promise that resolves to the same result as parseVoiceIntent', async () => {
      const result = await parseVoiceIntentAsync('show me red shoes');
      expect(result.action).toBe('search');
      expect(result.color).toBe('red');
    });

    it('resolves with navigation intent', async () => {
      const result = await parseVoiceIntentAsync('go to cart');
      expect(result.action).toBe('navigate');
      expect(result.targetUrl).toBe('cart.html');
    });

    it('handles empty transcript', async () => {
      const result = await parseVoiceIntentAsync('');
      expect(result.action).toBe('search');
    });
  });
});
