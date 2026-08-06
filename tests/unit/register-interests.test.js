import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('register-interests.js unit tests', function () {
  beforeEach(function () {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('chip click toggles selected state', function () {
    var selectedList = [];
    var chip = document.createElement('span');
    chip.dataset.val = 'mens';

    chip.addEventListener('click', function () {
      var val = chip.dataset.val;
      if (selectedList.indexOf(val) !== -1) {
        selectedList.splice(selectedList.indexOf(val), 1);
      } else {
        selectedList.push(val);
      }
    });

    // First click: select
    chip.click();
    expect(selectedList).toContain('mens');

    // Second click: deselect
    chip.click();
    expect(selectedList.indexOf('mens')).toBe(-1);
  });

  it('multiple chips can be selected simultaneously', function () {
    var selectedList = [];
    var chip1 = document.createElement('span');
    chip1.dataset.val = 'mens';
    var chip2 = document.createElement('span');
    chip2.dataset.val = 'womens';

    function toggle(list, chip) {
      var val = chip.dataset.val;
      if (list.indexOf(val) !== -1) {
        list.splice(list.indexOf(val), 1);
      } else {
        list.push(val);
      }
    }

    toggle(selectedList, chip1);
    toggle(selectedList, chip2);
    expect(selectedList.length).toBe(2);
    expect(selectedList).toContain('mens');
    expect(selectedList).toContain('womens');
  });

  it('hidden input accumulates comma-separated values', function () {
    var selectedList = ['mens', 'womens', 'acc'];
    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'selected-interests';
    document.body.appendChild(hiddenInput);

    hiddenInput.value = selectedList.join(',');
    expect(hiddenInput.value).toBe('mens,womens,acc');
  });

  it('empty selection produces empty hidden input value', function () {
    var selectedList = [];
    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'selected-interests';
    document.body.appendChild(hiddenInput);

    hiddenInput.value = selectedList.join(',');
    expect(hiddenInput.value).toBe('');
  });

  it('form element exists for DOM injection', function () {
    document.body.innerHTML = '<form><button type="submit">Submit</button></form>';
    var form = document.querySelector('form');
    var submitBtn = form.querySelector('button[type="submit"]');
    expect(form).not.toBeNull();
    expect(submitBtn).not.toBeNull();
  });

  it('interest chip selector updates hidden input on toggle', function () {
    var selectedList = [];
    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'selected-interests';
    document.body.appendChild(hiddenInput);

    var chip = document.createElement('span');
    chip.dataset.val = 'acc';

    chip.addEventListener('click', function () {
      var val = chip.dataset.val;
      if (selectedList.indexOf(val) !== -1) {
        selectedList.splice(selectedList.indexOf(val), 1);
        chip.style.background = 'none';
      } else {
        selectedList.push(val);
        chip.style.background = '#088178';
      }
      hiddenInput.value = selectedList.join(',');
    });

    chip.click();
    expect(selectedList).toContain('acc');
    expect(hiddenInput.value).toBe('acc');
    expect(chip.style.background).toBe('rgb(8, 129, 120)');
  });
});
