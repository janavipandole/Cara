(function () {
  'use strict';

  const SIZES = ['XXS', 'XS', 'S', 'M', 'L'];

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('size-calculator-form');
    const heightInput = document.getElementById('user-height');
    const weightInput = document.getElementById('user-weight');
    const bodytypeSelect = document.getElementById('user-bodytype');
    const resultBox = document.getElementById('calculator-result');
    const sizeText = document.getElementById('recommended-size-text');

    if (!form) return;

    // Load persisted measurements
    const saved = localStorage.getItem('userMeasurements');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.height) heightInput.value = data.height;
        if (data.weight) weightInput.value = data.weight;
        if (data.bodytype) bodytypeSelect.value = data.bodytype;
        // Run recommendation on load
        recommendSize(
          parseFloat(data.height),
          parseFloat(data.weight),
          data.bodytype
        );
      } catch (e) {
        console.error('Failed to parse saved measurements:', e);
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const height = parseFloat(heightInput.value);
      const weight = parseFloat(weightInput.value);
      const bodytype = bodytypeSelect.value;

      if (!height || !weight) return;

      recommendSize(height, weight, bodytype);

      // Persist measurements
      const data = { height, weight, bodytype };
      localStorage.setItem('userMeasurements', JSON.stringify(data));
    });

    function recommendSize(height, weight, bodytype) {
      let baseIndex = 2; // Default to 'S' (index 2)

      if (height < 155 || weight < 50) {
        baseIndex = 0; // XXS
      } else if (height < 165 && weight < 60) {
        baseIndex = 1; // XS
      } else if (height < 172 && weight < 70) {
        baseIndex = 2; // S
      } else if (height < 180 && weight < 80) {
        baseIndex = 3; // M
      } else {
        baseIndex = 4; // L
      }

      // Adjust for body type
      if (bodytype === 'slim') {
        baseIndex = Math.max(0, baseIndex - 1);
      } else if (bodytype === 'athletic') {
        baseIndex = Math.min(SIZES.length - 1, baseIndex + 1);
      }

      const recommendedSize = SIZES[baseIndex];

      // Render Result UI
      if (sizeText && resultBox) {
        sizeText.textContent = recommendedSize;
        resultBox.classList.remove('hidden');
      }

      // Highlight matching row in the table
      const rows = document.querySelectorAll('.size-chart tbody tr');
      rows.forEach((row) => {
        const sizeCell = row.querySelector('td:first-child');
        if (sizeCell && sizeCell.textContent.trim() === recommendedSize) {
          row.classList.add('recommended-row');
        } else {
          row.classList.remove('recommended-row');
        }
      });

      // Update product page size selection box
      const productSizeSelect = document.getElementById('product-size');
      if (productSizeSelect) {
        // Match the value
        for (let option of productSizeSelect.options) {
          if (option.text.trim() === recommendedSize) {
            productSizeSelect.value = option.value;
            // Dispatch change event so cart sync listener knows about size select change
            productSizeSelect.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
    }
  });
})();
