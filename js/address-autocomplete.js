/**
 * address-autocomplete.js
 * Enables real-time address suggestion dropdown on checkout.html using Google Maps Places API.
 */

(function () {
  'use strict';

  // ── DOM References ─────────────────────────────────────────────────────────
  const addressInput = document.getElementById('address');
  const cityInput = document.getElementById('city');
  const zipInput = document.getElementById('zip');

  // ── Initialise Google Maps Autocomplete ────────────────────────────────────
  function initGoogleAutocomplete() {
    if (!addressInput) return;
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      console.warn('Google Maps API not loaded. Autocomplete disabled.');
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ['address'],
      fields: ['address_components', 'geometry', 'name']
    });

    autocomplete.addListener('place_changed', function () {
      const place = autocomplete.getPlace();
      if (!place.address_components) {
        return;
      }

      let streetName = '';
      let streetNumber = '';
      let city = '';
      let zip = '';

      // Extract components
      place.address_components.forEach((component) => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          streetName = component.long_name;
        }
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
        if (types.includes('postal_code')) {
          zip = component.long_name;
        }
      });

      // Populate fields
      addressInput.value = `${streetNumber} ${streetName}`.trim() || place.name;
      if (cityInput) {
        cityInput.value = city;
        cityInput.dispatchEvent(new Event('input'));
      }
      if (zipInput) {
        zipInput.value = zip;
        zipInput.dispatchEvent(new Event('input'));
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initGoogleAutocomplete);
})();
