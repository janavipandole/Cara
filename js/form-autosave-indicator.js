/**
 * Form Auto-Save Indicator
 * Shows a subtle indicator when form data is being auto-saved to localStorage,
 * with restore functionality on page reload.
 */
(function () {
  'use strict';

  var STORAGE_PREFIX = 'cara_form_draft_';
  var SAVE_DEBOUNCE = 800;

  function getFormId(form) {
    return form.id || form.dataset.autosaveId || form.action || 'default';
  }

  function getStorageKey(form) {
    return STORAGE_PREFIX + getFormId(form);
  }

  function saveFormData(form) {
    var data = {};
    var fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(function (field) {
      if (!field.name && !field.id) return;
      var key = field.name || field.id;
      if (field.type === 'checkbox' || field.type === 'radio') {
        data[key] = field.checked;
      } else {
        data[key] = field.value;
      }
    });
    try {
      localStorage.setItem(getStorageKey(form), JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function restoreFormData(form) {
    try {
      var raw = localStorage.getItem(getStorageKey(form));
      if (!raw) return false;
      var data = JSON.parse(raw);
      var restored = false;
      Object.keys(data).forEach(function (key) {
        var field = form.querySelector('[name="' + key + '"], #' + key);
        if (!field) return;
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = data[key];
        } else {
          field.value = data[key];
        }
        restored = true;
      });
      return restored;
    } catch (e) {
      return false;
    }
  }

  function clearFormData(form) {
    try {
      localStorage.removeItem(getStorageKey(form));
    } catch (e) { /* ignore */ }
  }

  function showIndicator(form, status) {
    var indicator = form.querySelector('.autosave-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'autosave-indicator';
      form.appendChild(indicator);
    }
    indicator.className = 'autosave-indicator ' + status;
    if (status === 'saving') {
      indicator.innerHTML = '<span class="asi-dot"></span> Saving draft...';
    } else if (status === 'saved') {
      indicator.innerHTML = '<span class="asi-check">&#10003;</span> Draft saved';
      setTimeout(function () {
        indicator.className = 'autosave-indicator';
        indicator.innerHTML = '';
      }, 2000);
    } else if (status === 'restored') {
      indicator.innerHTML = '<span class="asi-restore">&#8630;</span> Draft restored';
      setTimeout(function () {
        indicator.className = 'autosave-indicator';
        indicator.innerHTML = '';
      }, 3000);
    }
  }

  function initForm(form) {
    if (!form || form.dataset.autosaveInit) return;
    form.dataset.autosaveInit = 'true';

    var restored = restoreFormData(form);
    if (restored) showIndicator(form, 'restored');

    var debounceTimer = null;
    form.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      showIndicator(form, 'saving');
      debounceTimer = setTimeout(function () {
        saveFormData(form);
        showIndicator(form, 'saved');
      }, SAVE_DEBOUNCE);
    });

    form.addEventListener('submit', function () {
      clearFormData(form);
    });

    var resetBtn = form.querySelector('[type="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        setTimeout(function () {
          clearFormData(form);
        }, 10);
      });
    }
  }

  function injectStyles() {
    if (document.getElementById('autosaveStyles')) return;
    var s = document.createElement('style');
    s.id = 'autosaveStyles';
    s.textContent =
      '.autosave-indicator{font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:6px;margin-top:6px;min-height:20px;transition:opacity .3s}' +
      '.autosave-indicator.saving{color:#f59e0b}' +
      '.autosave-indicator.saved{color:#16a34a}' +
      '.autosave-indicator.restored{color:#3b82f6}' +
      '.asi-dot{width:6px;height:6px;border-radius:50%;background:#f59e0b;animation:pulse-dot 1s infinite}' +
      '.asi-check,.asi-restore{font-size:14px}' +
      '@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}';
    document.head.appendChild(s);
  }

  function init() {
    injectStyles();
    document.querySelectorAll('form[data-autosave]').forEach(initForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CaraFormAutosave = { save: saveFormData, restore: restoreFormData, clear: clearFormData };
})();
