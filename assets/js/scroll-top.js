// Sleek Dynamic Scroll-to-Top Button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.id = 'scroll-to-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = '&#8593;';
  btn.style.cssText =
    'position:fixed;bottom:80px;right:20px;width:45px;height:45px;border-radius:50%;background:#088178;color:#fff;border:none;cursor:pointer;opacity:0;transition:all 0.3s ease;z-index:9999;font-weight:bold;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);transform:scale(0.8);';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.style.opacity = '1';
      btn.style.transform = 'scale(1)';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.8)';
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
