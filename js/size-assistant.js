/**
 * Intelligent Size Recommendation Algorithm
 */
class SizeAssistant {
    calculateSize(heightCm, weightKg) {
        if (weightKg < 55) return 'S';
        if (weightKg < 70) return 'M';
        if (weightKg < 85) return 'L';
        if (weightKg < 100) return 'XL';
        return 'XXL';
    }
}
window.sizeAssistant = new SizeAssistant();
