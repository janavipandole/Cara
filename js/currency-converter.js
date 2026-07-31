// Dynamic Multi-Currency Converter & Locale Formatter Module

export const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.25,
  JPY: 155.40,
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
};

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
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return amountInUSD * rate;
}

export function formatCurrency(amountInUSD, targetCurrency = getActiveCurrency()) {
  const converted = convertPrice(amountInUSD, targetCurrency);
  const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';
  return `${symbol}${converted.toFixed(2)}`;
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
  document.addEventListener('DOMContentLoaded', () => {
    initCurrencySelector();
  });
}
