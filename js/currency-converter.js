// Dynamic Multi-Currency Converter & Locale Formatter Module

export const DEFAULT_EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.25,
  JPY: 155.40,
  CAD: 1.36,
};

export let EXCHANGE_RATES = { ...DEFAULT_EXCHANGE_RATES };

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'CA$',
};

const CACHE_KEY = 'cara_exchange_rates_cache';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function fetchExchangeRates(fetchImpl = globalThis.fetch) {
  if (typeof localStorage !== 'undefined') {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (parsed && parsed.rates) {
          for (const code of Object.keys(DEFAULT_EXCHANGE_RATES)) {
            if (parsed.rates[code] != null) EXCHANGE_RATES[code] = parsed.rates[code];
          }
          if (
            typeof parsed.timestamp === 'number' &&
            Date.now() - parsed.timestamp < CACHE_TTL_MS
          ) {
            return EXCHANGE_RATES;
          }
        }
      }
    } catch {
      // Ignore cache parse errors
    }
  }

  if (typeof fetchImpl === 'function') {
    try {
      const response = await fetchImpl('https://open.er-api.com/v6/latest/USD');
      if (response.ok) {
        const data = await response.json();
        if (data && data.rates) {
          for (const code of Object.keys(DEFAULT_EXCHANGE_RATES)) {
            if (data.rates[code] != null) EXCHANGE_RATES[code] = data.rates[code];
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ timestamp: Date.now(), rates: EXCHANGE_RATES })
            );
          }
        }
      }
    } catch {
      // Fallback to default/cached rates on API failure or offline mode
    }
  }

  return EXCHANGE_RATES;
}

export function getActiveCurrency() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('cara_selected_currency') || 'USD';
  }
  return 'USD';
}

export function setActiveCurrency(currencyCode) {
  if (!EXCHANGE_RATES[currencyCode]) return false;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cara_selected_currency', currencyCode);
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: { currency: currencyCode } }));
  }
  return true;
}

export function convertPrice(amountInUSD, targetCurrency = getActiveCurrency()) {
  const amount =
    typeof amountInUSD === 'number' && isFinite(amountInUSD) ? amountInUSD : 0;
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return Math.round((amount * rate + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amountInUSD, targetCurrency = getActiveCurrency()) {
  const converted = convertPrice(amountInUSD, targetCurrency);
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';
  return `${symbol}${isFinite(converted) ? converted.toFixed(2) : '0.00'}`;
}

export function initCurrencySelector(selectElementId = 'currencySelect') {
  if (typeof document === 'undefined') return;
  const select = document.getElementById(selectElementId);
  if (!select) return;

  select.value = getActiveCurrency();
  select.addEventListener('change', (e) => {
    setActiveCurrency(e.target.value);
  });
}

if (typeof document !== 'undefined') {
  function initCurrencyConverter() {
    fetchExchangeRates();
    initCurrencySelector();
  }
  // Initialize when the DOM is ready. The immediate idempotent call covers
  // deferred scripts that load after DOMContentLoaded has already fired.
  document.addEventListener('DOMContentLoaded', initCurrencyConverter);
  initCurrencyConverter();
}
