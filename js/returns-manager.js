/**
 * Order Return & Refund Manager
 */
document.addEventListener('DOMContentLoaded', () => {
    const returnForm = document.getElementById('return-form');
    if (!returnForm) return;

    returnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const orderId = document.getElementById('orderId').value;
        const reason = document.getElementById('returnReason').value;

        const RMA = 'RMA-' + Math.floor(100000 + Math.random() * 900000);
        alert('Return request submitted successfully! Your RMA Tracking Code: ' + RMA);
        returnForm.reset();
    });
});
