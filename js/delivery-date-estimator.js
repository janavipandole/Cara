/**
 * Delivery Date Estimator Engine
 * Calculates estimated delivery dates taking into account cutoff hours, pincode regional tiers, and holiday blackouts.
 */
export class DeliveryDateEstimator {
  constructor(options = {}) {
    this.cutoffHour = options.cutoffHour || 14; // 2 PM cutoff
    this.blackoutDates = new Set(options.blackoutDates || []);
  }

  getPincodeTier(pincode) {
    const code = String(pincode || '').trim();
    if (!code || code.length < 3) return 'STANDARD';
    
    const prefix = parseInt(code.substring(0, 2), 10);
    if ([11, 40, 56, 60, 70].includes(prefix)) {
      return 'METRO'; // Fast delivery (1-2 days)
    } else if (prefix >= 10 && prefix <= 40) {
      return 'TIER_2'; // Standard (3-4 days)
    } else if (prefix >= 41 && prefix <= 70) {
      return 'TIER_3'; // Extended (5-6 days)
    }
    return 'REMOTE'; // Remote (7-9 days)
  }

  getTransitDays(tier) {
    switch (tier) {
      case 'METRO': return 2;
      case 'TIER_2': return 4;
      case 'TIER_3': return 6;
      case 'REMOTE': return 8;
      default: return 5;
    }
  }

  isWorkingDay(date) {
    const day = date.getDay();
    if (day === 0 || day === 6) return false; // Weekend
    
    const dateStr = date.toISOString().split('T')[0];
    if (this.blackoutDates.has(dateStr)) return false; // Blackout holiday
    
    return true;
  }

  calculateEstimatedDelivery(startDate, pincode) {
    let current = new Date(startDate);
    
    // Check order cutoff hour
    if (current.getHours() >= this.cutoffHour) {
      current.setDate(current.getDate() + 1);
    }

    const tier = this.getPincodeTier(pincode);
    let transitDaysNeeded = this.getTransitDays(tier);

    while (transitDaysNeeded > 0) {
      current.setDate(current.getDate() + 1);
      if (this.isWorkingDay(current)) {
        transitDaysNeeded--;
      }
    }

    return current;
  }

  getDeliveryWindowFormatted(startDate, pincode) {
    const minDate = this.calculateEstimatedDelivery(startDate, pincode);
    const maxDate = new Date(minDate);
    maxDate.setDate(maxDate.getDate() + 2);
    
    const formatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
    return {
      minDate,
      maxDate,
      tier: this.getPincodeTier(pincode),
      formatted: `${minDate.toLocaleDateString('en-US', formatOptions)} - ${maxDate.toLocaleDateString('en-US', formatOptions)}`
    };
  }
}
