/**
 * Multi-Step Checkout Wizard
 */
document.addEventListener('DOMContentLoaded', () => {
});


export function isValidStepBounds(index, maxSteps = 4) { return typeof index === 'number' && Number.isInteger(index) && index >= 1 && index <= maxSteps; }