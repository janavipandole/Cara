/**
 * Currency Selector UI Component
 */
document.addEventListener('DOMContentLoaded', () => {
    const selectorContainer = document.getElementById('currency-selector-wrapper');
    if (!selectorContainer) return;
    const currencies = [
        { code: 'USD', name: 'USD ($)', flag: '🇺🇸' },
        { code: 'EUR', name: 'EUR (€)', flag: '🇪🇺' },
        { code: 'GBP', name: 'GBP (£)', flag: '🇬🇧' },
        { code: 'INR', name: 'INR (₹)', flag: '🇮🇳' },
        { code: 'CAD', name: 'CAD ($)', flag: '🇨🇦' },
        { code: 'AUD', name: 'AUD ($)', flag: '🇦🇺' }
    ];
    const current = window.currencyConverter ? window.currencyConverter.currentCurrency : 'USD';
    let html = `<select id="global-currency-select" aria-label="Select Currency" class="currency-dropdown">`;
    currencies.forEach(c => {
        html += `<option value="${c.code}" ${c.code === current ? 'selected' : ''}>${c.flag} ${c.name}</option>`;
    });
    html += `</select>`;
    selectorContainer.innerHTML = html;
    const selectEl = document.getElementById('global-currency-select');
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            if (window.currencyConverter) window.currencyConverter.setCurrency(e.target.value);
        });
    }
});
