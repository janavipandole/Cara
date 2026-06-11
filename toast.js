class CaraToast {
  static init() {
    if (!document.getElementById('toast-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'toast-wrapper';
      wrapper.style.cssText =
        'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(wrapper);
    }
  }

  static show(message, type = 'success', duration = 3000) {
    this.init();
    const wrapper = document.getElementById('toast-wrapper');
    const toast = document.createElement('div');
    toast.className = `cara-toast cara-toast-${type}`;

    const colors = {
      success: '#088178',
      error: '#e23e57',
      warning: '#f39c12',
      info: '#3498db',
    };

    toast.style.cssText = `
            padding: 12px 24px;
            border-radius: 8px;
            color: #fff;
            background: ${colors[type] || colors.success};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            font-weight: 500;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;

    toast.textContent = message;
    wrapper.appendChild(toast);

    // Force reflow
    toast.offsetHeight;

    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}
