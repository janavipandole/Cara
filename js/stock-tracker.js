/**
 * Live Inventory Stock Alert System
 */
class StockTracker {
    constructor() {
        this.stockLevels = {
            'f1': 3,
            'f2': 12,
            'f3': 2,
            'f4': 18
        };
    }

    getStock(productId) {
        return this.stockLevels[productId] !== undefined ? this.stockLevels[productId] : 8;
    }
}
window.stockTracker = new StockTracker();
