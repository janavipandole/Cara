/**
 * Global Toast Notification Manager
 */
class ToastManager {
    show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-msg toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }
}
window.toastManager = new ToastManager();
