/**
 * Loyalty Rewards Floating Widget
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.loyaltyEngine) return;
    const widget = document.createElement('div');
    widget.className = 'loyalty-badge-widget';
    widget.innerHTML = `🏆 Rewards: <strong>${window.loyaltyEngine.points} pts</strong> (${window.loyaltyEngine.getTier()})`;
    document.body.appendChild(widget);
});
