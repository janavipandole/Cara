/**
 * AI-Powered Voice Search & Conversational Shopping Assistant
 * 
 * Provides voice speech recognition, intent parsing for product queries,
 * voice navigation, and SpeechSynthesis text-to-speech audio feedback.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.VoiceShoppingAssistant = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function isVoiceSupported() {
    return (
      typeof window !== 'undefined' &&
      (typeof window.SpeechRecognition !== 'undefined' ||
        typeof window.webkitSpeechRecognition !== 'undefined')
    );
  }

  function speakResponse(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore synthesis errors
    }
  }

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

    // Check Navigation Intent
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

    // Extract Color
    const colors = ['black', 'white', 'red', 'blue', 'green', 'navy', 'brown', 'pink', 'yellow'];
    for (const c of colors) {
      if (new RegExp(`\\b${c}\\b`).test(raw)) {
        intent.color = c;
        break;
      }
    }

    // Extract Category
    const categories = ['formal', 'street', 'minimal', 'top', 'bottom', 'shoes', 't-shirt', 'tshirt', 'hoodie'];
    for (const cat of categories) {
      if (new RegExp(`\\b${cat}\\b`).test(raw)) {
        intent.category = cat;
        break;
      }
    }

    // Extract Price Limit (e.g. "under 50", "under fifty dollars", "less than $100")
    const priceMatch = raw.match(/(?:under|below|less than)\s+\$?(\d+)/i);
    if (priceMatch) {
      intent.maxPrice = parseFloat(priceMatch[1]);
    } else if (raw.includes('under fifty') || raw.includes('below fifty')) {
      intent.maxPrice = 50;
    } else if (raw.includes('under one hundred') || raw.includes('below one hundred')) {
      intent.maxPrice = 100;
    }

    // Clean search query string
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

  class VoiceShoppingAssistant {
    constructor(options = {}) {
      this.isListening = false;
      this.recognition = null;
      this.onResultCallback = options.onResult || null;

      this.initRecognition();
    }

    initRecognition() {
      if (!isVoiceSupported()) return;

      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicrophoneUI(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicrophoneUI(false);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const intent = parseVoiceIntent(transcript);
        this.handleParsedIntent(intent);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        this.updateMicrophoneUI(false);
        speakResponse('Voice recognition could not hear you. Please try again.');
      };
    }

    toggleListening(btnElement) {
      if (!this.recognition) {
        alert('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      this.activeBtn = btnElement;
      if (this.isListening) {
        this.recognition.stop();
      } else {
        try {
          this.recognition.start();
        } catch (e) {
          // ignore start errors
        }
      }
    }

    updateMicrophoneUI(active) {
      if (!this.activeBtn) return;
      if (active) {
        this.activeBtn.classList.add('listening-pulse');
        this.activeBtn.setAttribute('aria-label', 'Stop listening voice assistant');
      } else {
        this.activeBtn.classList.remove('listening-pulse');
        this.activeBtn.setAttribute('aria-label', 'Start AI voice search');
      }
    }

    handleParsedIntent(intent) {
      if (intent.action === 'navigate' && intent.targetUrl) {
        speakResponse(`Navigating to ${intent.targetUrl.replace('.html', '')}`);
        window.location.href = intent.targetUrl;
        return;
      }

      // Voice Search Execution
      const searchInput = document.getElementById('search-input') || document.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.value = intent.query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const responseText = `Searching for ${intent.query}`;
      speakResponse(responseText);

      if (typeof this.onResultCallback === 'function') {
        this.onResultCallback(intent);
      }
    }
  }

  return {
    VoiceShoppingAssistant,
    parseVoiceIntent,
    parseVoiceIntentAsync,
    speakResponse,
    isVoiceSupported,
  };
});
