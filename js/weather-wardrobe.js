(function () {
  'use strict';
  const el = document.getElementById('cara-weather-wardrobe');
  if (!el) return;
  const temp = parseFloat(el.getAttribute('data-temp') || '0');
  let pick = 'Light layers';
  if (temp >= 30) pick = 'Breathable cotton & linen';
  else if (temp >= 22) pick = 'Light tees & dresses';
  else if (temp >= 15) pick = 'Layered denim & knits';
  else pick = 'Cozy jackets & sweatshirts';
  const label = el.querySelector('.cara-wardrobe-pick');
  if (label) label.textContent = pick;
})();
