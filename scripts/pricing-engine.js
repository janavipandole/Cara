// Mock AI Dynamic Pricing Engine
// Analyzes demand, inventory, and time to adjust prices.

export class DynamicPricingEngine {
  constructor() {
    this.peakHours = [18, 19, 20, 21]; // 6 PM to 9 PM
    this.demandMultiplier = 1.15; // 15% increase during peak
    this.clearanceMultiplier = 0.8; // 20% off for high inventory
  }

  calculatePrice(basePrice, inventoryLevel) {
    const currentHour = new Date().getHours();
    let finalPrice = basePrice;

    // Apply peak demand surge
    if (this.peakHours.includes(currentHour)) {
      finalPrice *= this.demandMultiplier;
    }

    // Apply clearance discount if inventory is high
    if (inventoryLevel > 100) {
      finalPrice *= this.clearanceMultiplier;
    }

    return Math.round(finalPrice);
  }
}
