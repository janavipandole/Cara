// Dual-handle price range slider (Issue #7955): visual behaviour only.
// The two native <input type="range"> elements remain the source of truth;
// products.js reads their values to filter products.

export function formatPrice(value) {
  return '₹' + Number(value).toLocaleString('en-IN');
}

export function clampMin(minVal, maxVal) {
  return minVal > maxVal ? maxVal : minVal;
}

export function clampMax(maxVal, minVal) {
  return maxVal < minVal ? minVal : maxVal;
}

export function getFillPercent(minVal, maxVal, sliderMin, sliderMax) {
  const span = sliderMax - sliderMin || 1;
  const left = ((minVal - sliderMin) / span) * 100;
  const right = 100 - ((maxVal - sliderMin) / span) * 100;
  return { left, right };
}

export function initPriceRangeSlider() {
  const minInput = document.getElementById('price-min-input');
  const maxInput = document.getElementById('price-max-input');
  const rangeFill = document.getElementById('price-slider-range');
  const minLabel = document.getElementById('price-min-value');
  const maxLabel = document.getElementById('price-max-value');

  if (!minInput || !maxInput || !rangeFill || !minLabel || !maxLabel) return;

  const sliderMin = Number(minInput.min);
  const sliderMax = Number(minInput.max);

  function render() {
    const minVal = clampMin(Number(minInput.value), Number(maxInput.value));
    const maxVal = clampMax(Number(maxInput.value), Number(minInput.value));
    minInput.value = minVal;
    maxInput.value = maxVal;

    const { left, right } = getFillPercent(
      minVal,
      maxVal,
      sliderMin,
      sliderMax,
    );
    rangeFill.style.left = left + '%';
    rangeFill.style.right = right + '%';

    minLabel.textContent = formatPrice(minVal);
    maxLabel.textContent = formatPrice(maxVal);

    const mid = (sliderMin + sliderMax) / 2;
    minInput.style.zIndex = minVal > mid ? 3 : 2;
    maxInput.style.zIndex = minVal > mid ? 2 : 3;
  }

  minInput.addEventListener('input', render);
  maxInput.addEventListener('input', render);

  render();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initPriceRangeSlider);
}
