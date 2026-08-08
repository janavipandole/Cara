/**
 * Pincode / Postal Code Validation & Serviceability Engine
 * Validates postal code formatting across countries and calculates estimated delivery speed.
 */

export class PincodeValidationEngine {
  constructor() {
    this.postalPatterns = {
      US: /^\d{5}(-\d{4})?$/,
      IN: /^[1-9][0-9]{5}$/,
      UK: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
      CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i
    };
  }

  validatePostalCode(code, countryCode = 'IN') {
    if (!code || typeof code !== 'string') {
      return { valid: false, reason: 'Postal code must be a non-empty string' };
    }
    const pattern = this.postalPatterns[countryCode.toUpperCase()];
    if (!pattern) {
      // Fallback basic alphanumeric check (must contain at least one digit)
      const genericValid = /^(?=.*[0-9])[a-zA-Z0-9\s-]{3,10}$/.test(code.trim());
      return { valid: genericValid, reason: genericValid ? 'Generic code valid' : 'Invalid generic postal format' };
    }

    const isValid = pattern.test(code.trim());
    return {
      valid: isValid,
      reason: isValid ? 'Serviceable postal region' : `Invalid ${countryCode} postal code format`
    };
  }


  getDeliveryZone(code, countryCode = 'IN') {
    const delivery = this.estimateDeliveryDays(code, countryCode);
    if (!delivery) return null;
    return {
      zone: delivery.tier,
      estimatedDaysText: `${delivery.minDays}-${delivery.maxDays} business days`
    };
  }

  estimateDeliveryDays(code, countryCode = 'IN') {
    if (code === null || code === undefined || typeof code !== 'string') {
      return null;
    }
    const check = this.validatePostalCode(code, countryCode);
    if (!check.valid) return null;

    const country = countryCode.toUpperCase();
    // The metro-zone heuristic below uses Indian PIN ranges (11-40),
    // so only apply it to Indian pincodes.
    if (country === 'IN') {
      const numericVal = parseInt(code.replace(/\D/g, '').substring(0, 2), 10) || 0;
      if (numericVal >= 11 && numericVal <= 40) {
        return { minDays: 1, maxDays: 3, tier: 'Express Zone' };
      }
      return { minDays: 3, maxDays: 5, tier: 'Standard Zone' };
    }

    // Non-Indian pincodes: use a country-agnostic default estimate.
    return { minDays: 3, maxDays: 7, tier: 'Standard Zone' };
  }
}
