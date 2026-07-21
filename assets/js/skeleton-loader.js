class SkeletonLoader {
  static render(containerId, count = 8) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'skeleton-card';
      card.style.cssText =
        'border:1px solid #cceeec;border-radius:20px;padding:12px;margin:15px 0;width:23%;min-width:250px;animation:pulse 1.5s infinite ease-in-out;';
      card.innerHTML = `
                <div style="width:100%;height:220px;background:#f3f3f3;border-radius:20px;margin-bottom:10px;"></div>
                <div style="width:50%;height:15px;background:#f3f3f3;border-radius:4px;margin-bottom:8px;"></div>
                <div style="width:80%;height:20px;background:#f3f3f3;border-radius:4px;margin-bottom:8px;"></div>
                <div style="width:30%;height:15px;background:#f3f3f3;border-radius:4px;"></div>
            `;
      container.appendChild(card);
    }
  }
}
