/**
 * Customer Loyalty Tier & Points Calculator
 */
class LoyaltyEngine {
    constructor() {
        this.points = parseInt(localStorage.getItem('cara_loyalty_points') || '250');
    }

    addPoints(amountSpent) {
        const earned = Math.floor(amountSpent * 10);
        this.points += earned;
        localStorage.setItem('cara_loyalty_points', this.points.toString());
        return earned;
    }

    getTier() {
        if (this.points > 1000) return 'Gold';
        if (this.points > 500) return 'Silver';
        return 'Bronze';
    }
}
window.loyaltyEngine = new LoyaltyEngine();
