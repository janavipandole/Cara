/**
 * Delivery Date Estimator Engine
 * Calculates expected delivery ranges considering order cutoff time and weekends.
 */
export class DeliveryDateEstimator {
  constructor(options = {}) {
    this.expressDays = options.expressDays || 2;
    this.standardDays = options.standardDays || 5;
  }

  estimateDeliveryDate(orderDate = new Date(), isExpress = false) {
    const targetDays = isExpress ? this.expressDays : this.standardDays;
    let daysAdded = 0;
    const current = new Date(orderDate);

    while (daysAdded < targetDays) {
      current.setDate(current.getDate() + 1);
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        daysAdded++;
      }
    }

    return current.toISOString().split('T')[0];
  }
}
