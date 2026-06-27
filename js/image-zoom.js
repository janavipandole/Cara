// Reusable image magnifying magnifier tool
document.addEventListener('DOMContentLoaded', () => {
  const mainImg = document.getElementById('MainImg');
  if (!mainImg) return;

  const zoomLens = document.createElement('div');
  zoomLens.style.cssText =
    'position:absolute; border:1px solid #088178; border-radius:50%; width:100px; height:100px; display:none; background-repeat:no-repeat; pointer-events:none; box-shadow:0 0 10px rgba(0,0,0,0.3);';
  mainImg.parentNode.style.position = 'relative';
  mainImg.parentNode.appendChild(zoomLens);

  mainImg.addEventListener('mousemove', (e) => {
    zoomLens.style.display = 'block';
    const rect = mainImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    zoomLens.style.left = `${x - 50}px`;
    zoomLens.style.top = `${y - 50}px`;

    const ratio = 2.5; // Zoom scale factor
    zoomLens.style.backgroundImage = `url('${mainImg.src}')`;
    zoomLens.style.backgroundSize = `${rect.width * ratio}px ${rect.height * ratio}px`;
    zoomLens.style.backgroundPosition = `-${x * ratio - 50}px -${y * ratio - 50}px`;
  });

  mainImg.addEventListener('mouseleave', () => {
    zoomLens.style.display = 'none';
  });
});
