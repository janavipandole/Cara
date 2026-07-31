// Print-Friendly Terms Optimization
document.addEventListener('DOMContentLoaded', () => {
  const parentContainer = document.querySelector('section') || document.body;

  // Inject Print Button
  const btn = document.createElement('button');
  btn.innerHTML = `<i class="ri-printer-line"></i> Print / Save Terms as PDF`;
  btn.style.cssText =
    'padding:10px 18px; background:#088178; color:white; border:none; border-radius:4px; font-weight:600; cursor:pointer; margin-bottom:20px; font-family:sans-serif;';

  parentContainer.parentNode.insertBefore(btn, parentContainer);

  btn.addEventListener('click', () => {
    window.print();
  });

  // Dynamically inject @media print styles
  const style = document.createElement('style');
  style.innerHTML = `
        @media print {
            header, footer, #header, #newsletter, .mobile, button {
                display: none !important;
            }
            body {
                background: white !important;
                color: black !important;
                font-size: 14px !important;
                line-height: 1.6 !important;
            }
        }
    `;
  document.head.appendChild(style);
});
