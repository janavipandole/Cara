import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Unit tests for js/register-interests.js interest chip selection logic.
 */

describe('register-interests logic', () => {
  // The module manages a selectedList array and toggles interest chips.
  // We test the core selection/deselection logic by recreating it.

  let selectedList;

  beforeEach(() => {
    selectedList = [];
  });

  function toggleInterest(selectedList, val) {
    const idx = selectedList.indexOf(val);
    if (idx !== -1) {
      selectedList.splice(idx, 1);
      return { action: 'removed', selectedList: [...selectedList] };
    } else {
      selectedList.push(val);
      return { action: 'added', selectedList: [...selectedList] };
    }
  }

  it('adds an interest when not already selected', () => {
    const result = toggleInterest(selectedList, 'mens');
    expect(result.action).toBe('added');
    expect(result.selectedList).toContain('mens');
    expect(result.selectedList).toHaveLength(1);
  });

  it('removes an interest when already selected', () => {
    selectedList.push('womens');
    const result = toggleInterest(selectedList, 'womens');
    expect(result.action).toBe('removed');
    expect(result.selectedList).not.toContain('womens');
    expect(result.selectedList).toHaveLength(0);
  });

  it('supports multiple selections', () => {
    toggleInterest(selectedList, 'mens');
    toggleInterest(selectedList, 'womens');
    toggleInterest(selectedList, 'acc');
    expect(selectedList).toHaveLength(3);
    expect(selectedList).toContain('mens');
    expect(selectedList).toContain('womens');
    expect(selectedList).toContain('acc');
  });

  it('comma-joins selected interests for hidden input value', () => {
    selectedList.push('mens', 'womens', 'acc');
    const hiddenValue = selectedList.join(',');
    expect(hiddenValue).toBe('mens,womens,acc');
  });

  it('handles empty selection correctly', () => {
    const hiddenValue = selectedList.join(',');
    expect(hiddenValue).toBe('');
  });

  it('toggling same interest twice returns it to unselected', () => {
    toggleInterest(selectedList, 'mens');
    toggleInterest(selectedList, 'mens');
    expect(selectedList).toHaveLength(0);
  });

  it('preserves order of selection', () => {
    toggleInterest(selectedList, 'womens');
    toggleInterest(selectedList, 'mens');
    toggleInterest(selectedList, 'acc');
    expect(selectedList[0]).toBe('womens');
    expect(selectedList[1]).toBe('mens');
    expect(selectedList[2]).toBe('acc');
  });
});
