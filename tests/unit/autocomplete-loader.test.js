import { describe, it, expect } from 'vitest';
import { AutocompleteLoader } from '../../js/autocomplete-loader.js';

describe('js/autocomplete-loader.js AutocompleteLoader tests', () => {
  it('should show loader by setting display to block', () => {
    const mockEl = {
      style: { display: 'none' },
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = value; }
    };
    const loader = new AutocompleteLoader(mockEl);
    loader.showLoader();
    expect(mockEl.style.display).toBe('block');
    expect(mockEl.attributes['aria-busy']).toBe('true');
  });

  it('should hide loader by setting display to none', () => {
    const mockEl = {
      style: { display: 'block' },
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = value; }
    };
    const loader = new AutocompleteLoader(mockEl);
    loader.hideLoader();
    expect(mockEl.style.display).toBe('none');
    expect(mockEl.attributes['aria-busy']).toBe('false');
  });
});
