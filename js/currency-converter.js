/**
 * Dynamic Multi-Currency Converter Engine
 * Cara E-Commerce Platform
 */
class CurrencyConverter {
    constructor() {
        this.rates = { USD: 1.0, EUR: 0.92, GBP: 0.79, INR: 83.25, CAD: 1.36, AUD: 1.52 };
        this.symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$', AUD: 'AU$' };
        this.currentCurrency = localStorage.getItem('cara_user_currency') || 'USD';
    }

    setCurrency(code) {
        if (this.rates[code]) {
            this.currentCurrency = code;
            localStorage.setItem('cara_user_currency', code);
            this.updateDOMPrices();
            window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: code } }));
        }
    }

    convert(amountInUSD) {
        const rate = this.rates[this.currentCurrency] || 1;
        return (amountInUSD * rate).toFixed(2);
    }

    formatPrice(amountInUSD) {
        const symbol = this.symbols[this.currentCurrency] || '$';
        const converted = this.convert(amountInUSD);
        return `${symbol}${converted}`;
    }

    updateDOMPrices() {
        const priceElements = document.querySelectorAll('[data-usd-price]');
        priceElements.forEach(el => {
            const usd = parseFloat(el.getAttribute('data-usd-price'));
            if (!isNaN(usd)) {
                el.textContent = this.formatPrice(usd);
            }
        });
    }
}

window.currencyConverter = new CurrencyConverter();
document.addEventListener('DOMContentLoaded', () => window.currencyConverter.updateDOMPrices());
