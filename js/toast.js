export class CaraToast {
  static show(message, type = 'info', duration = 4000) {
    const container =
      document.getElementById('toast-container') ||
      (() => {
        const el = document.createElement('div');
        el.id = 'toast-container';
        document.body.appendChild(el);
        return el;
      })();

    const icons = {
      info: 'Info',
      success: 'Done',
      error: 'Error',
      warning: 'Warn',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-msg">${this._escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
      <span class="toast-progress" style="animation-duration:${duration}ms"></span>
    `;

    toast
      .querySelector('.toast-close')
      .addEventListener('click', () => this._dismiss(toast));

    container.appendChild(toast);

    const autoTimer = setTimeout(() => this._dismiss(toast), duration);
    toast._autoTimer = autoTimer;

    toast.addEventListener('mouseenter', () => {
      clearTimeout(toast._autoTimer);
      const bar = toast.querySelector('.toast-progress');
      if (bar) bar.style.animationPlayState = 'paused';
    });

    toast.addEventListener('mouseleave', () => {
      toast._autoTimer = setTimeout(() => this._dismiss(toast), 1500);
      const bar = toast.querySelector('.toast-progress');
      if (bar) bar.style.animationPlayState = 'running';
    });
  }

  static _escapeHtml(value) {
    return String(value).replace(
      /[&<>"']/g,
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

  static _dismiss(toast) {
    if (toast._dismissing) return;
    toast._dismissing = true;
    clearTimeout(toast._autoTimer);
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 350);
  }
}

if (typeof window !== 'undefined') {
  window.CaraToast = CaraToast;
}
