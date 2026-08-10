/**
 * toast-manager.js
 * Advanced, reusable Toast Notification System
 */

class ToastManager {
  constructor() {
    this.container = document.getElementById('advanced-toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'advanced-toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `advanced-toast toast-${type}`;
    
    const iconMap = {
      success: 'ri-checkbox-circle-line',
      error: 'ri-error-warning-line',
      info: 'ri-information-line',
      warning: 'ri-alert-line'
    };
    
    toast.innerHTML = `
      <i class="${iconMap[type]} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close"><i class="ri-close-line"></i></button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }

  dismiss(toast) {
    toast.classList.remove('toast-show');
    toast.addEventListener('transitionend', () => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
  }
}

window.Toast = new ToastManager();
