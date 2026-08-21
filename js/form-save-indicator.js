(function () {
  'use strict';
  document.querySelectorAll('[data-autosave-form]').forEach((form) => {
    const chip = document.createElement('span');
    chip.className = 'cara-autosave-status';
    chip.setAttribute('role', 'status');
    chip.textContent = 'Saved';
    form.appendChild(chip);
    let timer = null;
    form.addEventListener('input', () => {
      chip.textContent = 'Saving...';
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const data = Object.fromEntries(new FormData(form).entries());
          localStorage.setItem('cara_form_draft_' + form.id, JSON.stringify(data));
          chip.textContent = 'Saved';
        } catch (e) {
          chip.textContent = 'Save unavailable';
        }
      }, 600);
    });
  });
})();
