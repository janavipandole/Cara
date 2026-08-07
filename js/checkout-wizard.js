/**
 * Multi-Step Checkout Wizard
 */
document.addEventListener('DOMContentLoaded', () => {
});


export function isValidStepBounds(index, maxSteps = 4) { return typeof index === 'number' && index >= 1 && index <= maxSteps; }