// Interactive Newsletter Interest Selector
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  const interestContainer = document.createElement('div');
  interestContainer.className = 'newsletter-interests-wrapper';
  interestContainer.style.cssText =
    'margin-bottom: 20px; font-family: sans-serif;';
  interestContainer.innerHTML = `
        <label style="display:block; font-size:13px; font-weight:700; margin-bottom:6px; color:#555;">Shopping Interests (Select categories you love):</label>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span class="interest-chip" data-val="mens" style="padding:6px 12px; border:1px solid #088178; border-radius:15px; font-size:12px; font-weight:600; cursor:pointer; color:#088178; transition:all 0.2s;">Men's Apparel</span>
            <span class="interest-chip" data-val="womens" style="padding:6px 12px; border:1px solid #088178; border-radius:15px; font-size:12px; font-weight:600; cursor:pointer; color:#088178; transition:all 0.2s;">Women's Apparel</span>
            <span class="interest-chip" data-val="acc" style="padding:6px 12px; border:1px solid #088178; border-radius:15px; font-size:12px; font-weight:600; cursor:pointer; color:#088178; transition:all 0.2s;">Accessories</span>
        </div>
        <input type="hidden" id="selected-interests" name="interests" value="" />
    `;

  const submitBtn =
    form.querySelector('button') || form.querySelector("[type='submit']");
  if (submitBtn) {
    submitBtn.parentNode.insertBefore(interestContainer, submitBtn);
  }

  const selectedList = [];
  document.querySelectorAll('.interest-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.dataset.val;
      if (selectedList.includes(val)) {
        selectedList.splice(selectedList.indexOf(val), 1);
        chip.style.background = 'none';
        chip.style.color = '#088178';
      } else {
        selectedList.push(val);
        chip.style.background = '#088178';
        chip.style.color = 'white';
      }
      document.getElementById('selected-interests').value =
        selectedList.join(',');
    });
  });
});
