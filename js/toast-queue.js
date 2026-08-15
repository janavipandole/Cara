// Reusable Toast Notification Queue Manager

const HTML_ESCAPE_REGEX = /[&<>"']/g;

function escapeHtml(value) {
  return String(value).replace(
    HTML_ESCAPE_REGEX,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  );
}

export class ToastQueueManager {
  constructor(maxToasts = 5) {
    this.maxToasts = maxToasts;
    this.queue = [];
    this.container = null;
    this._paused = false;
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
    // When paused, queue the item but do not render it yet.
    if (this._paused) {
      const toastItem = { id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, message, type, duration, _pending: true };
      this.queue.push(toastItem);
      return toastItem.id;
    }
    const container = this.getOrCreateContainer();
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const toastItem = {
      id: toastId,
      message,
      type,
      duration,
    };

    this.queue.push(toastItem);
    if (!this._paused && this.queue.length > this.maxToasts) {
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
          <span class="toast-message">${escapeHtml(message)}</span>
        </div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
      `;

      const closeBtn = el.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.dismiss(toastId));
      }

      container.appendChild(el);

      const timerId = duration > 0 ? setTimeout(() => this.dismiss(toastId), duration) : null;
      toastItem.timerId = timerId;
    }

    return toastId;
  }

  dismiss(toastId) {
    const item = this.queue.find((t) => t.id === toastId);
    if (item && item.timerId) {
      clearTimeout(item.timerId);
    }
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

  pause() {
    this._paused = true;
  }

  resume() {
    if (!this._paused) return;
    const pending = this.queue.splice(0, this.queue.length, ...this.queue.filter((t) => !t._pending));
    this._paused = false;
    // Render pending items by calling show for each (show() will handle them normally now).
    pending.forEach((t) => {
      this._paused = false;
      const container = this.getOrCreateContainer();
      const el = document.createElement('div');
      el.id = t.id;
      el.className = 'toast-card toast-' + t.type;
      el.setAttribute('role', 'alert');
      el.innerHTML =
        '<div class="toast-content">' +
        '<span class="toast-icon">' + (t.type === 'success' ? '&#10003;' : t.type === 'error' ? '&#10005;' : '&#8505;') + '</span>' +
        '<span class="toast-message">' + escapeHtml(t.message) + '</span></div>' +
        '<button class="toast-close" aria-label="Close notification">&times;</button>';
      if (container) container.appendChild(el);
      if (t.duration > 0) setTimeout(() => this.dismiss(t.id), t.duration);
    });
  }
}

export const globalToastQueue = new ToastQueueManager();


export function getToastQueueStatusHelper85() {
  return { status: "ok", fn: "getToastQueueStatusHelper85" };
}
