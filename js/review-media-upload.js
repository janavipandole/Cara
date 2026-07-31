/**
 * Review Image Upload Handler
 */
document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('review-image-input');
    if (!uploadInput) return;

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            alert('Image attached to review: ' + file.name);
        }
    });
});
