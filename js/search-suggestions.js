(function () {
  'use strict';
  const input = document.querySelector('[data-search-autocomplete]');
  if (!input) return;
  const source = (input.getAttribute('data-search-autocomplete') || '').split('|').filter(Boolean);
  const list = document.createElement('ul');
  list.hidden = true;
  list.className = 'cara-search-suggestions';
  input.parentNode.appendChild(list);
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { list.hidden = true; return; }
    const matches = source.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
    list.innerHTML = '';
    matches.forEach((m) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = m;
      b.addEventListener('click', () => {
        input.value = m;
        list.hidden = true;
        input.form && input.form.submit();
      });
      li.appendChild(b);
      list.appendChild(li);
    });
    list.hidden = matches.length === 0;
  });
  input.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 150));
})();
