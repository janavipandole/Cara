(function () {
  'use strict';
  const KEY = 'cara_price_watch';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  document.querySelectorAll('[data-price-watch]').forEach((el) => {
    const sku = el.getAttribute('data-price-watch');
    const price = parseFloat(el.getAttribute('data-current-price'));
    if (!sku || Number.isNaN(price)) return;
    const watch = read();
    if (watch[sku] !== undefined && price < watch[sku]) {
      window.dispatchEvent(new CustomEvent('cara:price-drop', { detail: { sku, from: watch[sku], to: price } }));
    }
    watch[sku] = price;
    write(watch);
  });
})();
