/**
 * Smart Product Recommendation Algorithm
 */
export class RecommendationEngine {
    constructor() {
        this.historyKey = 'cara_view_history';
    }

    getRecommendations() {
        let history = [];
        try {
            const raw = localStorage.getItem(this.historyKey);
            const parsed = raw ? JSON.parse(raw) : [];
            history = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            // Corrupt or legacy storage falls back to defaults.
            history = [];
        }
        if (history.length === 0) return this.getDefaultRecommendations();
        return history.slice(0, 4);
    }

    getDefaultRecommendations() {
        return [
            { id: 1, name: 'Cartoon Astronaut T-Shirt', price: 78, image: 'images/products/f1.jpg' },
            { id: 2, name: 'Hawaiian Floral Shirt', price: 85, image: 'images/products/f2.jpg' },
            { id: 3, name: 'Vintage Rose Pattern Shirt', price: 92, image: 'images/products/f3.jpg' }
        ];
    }
}
window.recommendationEngine = new RecommendationEngine();
