class ProductImageZoom {
    static attach(imgId, containerId) {
        const img = document.getElementById(imgId);
        const container = document.getElementById(containerId);
        if (!img || !container) return;
        
        const zoomResult = document.createElement('div');
        zoomResult.style.cssText = 'position:absolute;width:300px;height:300px;border:1px solid #d4d4d4;background-repeat:no-repeat;display:none;z-index:999;right:-320px;top:0;';
        container.style.position = 'relative';
        container.appendChild(zoomResult);
        
        img.addEventListener('mousemove', (e) => {
            zoomResult.style.display = 'block';
            const rect = img.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            zoomResult.style.backgroundImage = `url('${img.src}')`;
            zoomResult.style.backgroundSize = `${img.width * 2}px ${img.height * 2}px`;
            zoomResult.style.backgroundPosition = `-${x * 2}px -${y * 2}px`;
        });
        
        img.addEventListener('mouseleave', () => {
            zoomResult.style.display = 'none';
        });
    }
}
