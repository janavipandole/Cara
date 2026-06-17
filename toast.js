class CaraToast {
  static show(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `cara-toast cara-toast-${type}`;
    toast.style.cssText =
      'position:fixed;bottom:20px;right:20px;padding:12px 24px;border-radius:4px;color:#fff;background:#088178;z-index:9999;transition:opacity 0.3s;';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
