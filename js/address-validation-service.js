/**
 * Address Validation Service
 * Validates street address formatting, postal code regex patterns per country, state detection, and sanitization.
 */

class AddressValidationService {
  constructor() {
    this.postalRegex = {
      US: /^\d{5}(-\d{4})?$/,
      IN: /^\d{6}$/,
      UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
      AU: /^\d{4}$/
    };
  }

  validatePostalCode(postalCode, country = 'US') {
    if (!postalCode || typeof postalCode !== 'string') {
      return { valid: false, message: 'Postal code is required.' };
    }

    const clean = postalCode.trim().toUpperCase();
    const regex = this.postalRegex[country.toUpperCase()] || /^[A-Z0-9 -]{3,10}$/i;

    if (!regex.test(clean)) {
      return { valid: false, message: `Invalid postal code format for ${country}.` };
    }

    return { valid: true, postalCode: clean };
  }

  validateAddress({ street = '', city = '', state = '', postalCode = '', country = 'US' } = {}) {
    const errors = {};

    if (!street.trim() || street.trim().length < 5) {
      errors.street = 'Street address must be at least 5 characters.';
    }

    if (!city.trim()) {
      errors.city = 'City name is required.';
    }

    if (!state.trim()) {
      errors.state = 'State/Province is required.';
    }

    const postalVal = this.validatePostalCode(postalCode, country);
    if (!postalVal.valid) {
      errors.postalCode = postalVal.message;
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
      sanitized: isValid
        ? {
            street: street.trim().replace(/<[^>]*>/g, ''),
            city: city.trim(),
            state: state.trim().toUpperCase(),
            postalCode: postalCode.trim().toUpperCase(),
            country: country.trim().toUpperCase()
          }
        : null
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AddressValidationService;
} else {
  window.AddressValidationService = AddressValidationService;
}
