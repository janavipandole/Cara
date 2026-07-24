// Reusable Toast Notification Queue Manager

export class ToastQueueManager {
  constructor(maxToasts = 5) {
    this.maxToasts = maxToasts;
    this.queue = [];
    this.container = null;
  }

  getOrCreateContainer() {
    if (typeof document === 'undefined') return null;
    if (!this.container) {
      this.container = document.getElementById('toast-queue-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-queue-container';
        this.container.className = 'toast-queue-container';
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  show(message, type = 'info', duration = 3000) {
    const container = this.getOrCreateContainer();
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const toastItem = {
      id: toastId,
      message,
      type,
      duration,
    };

    this.queue.push(toastItem);
    if (this.queue.length > this.maxToasts) {
      this.dismiss(this.queue[0].id);
    }

    if (container) {
      const el = document.createElement('div');
      el.id = toastId;
      el.className = `toast-card toast-${type}`;
      el.setAttribute('role', 'alert');
      el.innerHTML = `
        <div class="toast-content">
          <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
          <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
      `;

      const closeBtn = el.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.dismiss(toastId));
      }

      container.appendChild(el);

      if (duration > 0) {
        setTimeout(() => this.dismiss(toastId), duration);
      }
    }

    return toastId;
  }

  dismiss(toastId) {
    this.queue = this.queue.filter((t) => t.id !== toastId);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(toastId);
      if (el) {
        el.classList.add('toast-fade-out');
        setTimeout(() => el.remove(), 200);
      }
    }
  }

  clearAll() {
    this.queue.forEach((t) => this.dismiss(t.id));
    this.queue = [];
  }
}

export const globalToastQueue = new ToastQueueManager();
