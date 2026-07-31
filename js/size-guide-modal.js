/**
 * Size Guide Modal Component
 */
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('open-size-guide');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const weight = prompt('Enter your weight in kg to get accurate size recommendation:');
        if (weight && window.sizeAssistant) {
            const recommended = window.sizeAssistant.calculateSize(175, parseFloat(weight));
            alert('Based on your input, your recommended size is: ' + recommended);
        }
    });
});
