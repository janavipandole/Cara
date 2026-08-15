(function () {
  'use strict';
  document.querySelectorAll('[data-size-guide-trigger]').forEach((trigger) => {
    const target = document.querySelector(trigger.getAttribute('data-size-guide-trigger'));
    if (!target) return;
    const show = () => { target.hidden = false; };
    const hide = () => { target.hidden = true; };
    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
    target.hidden = true;
  });
})();
