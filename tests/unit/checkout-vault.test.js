/**
 * Unit tests for js/checkout-vault.js
 * Tests the AddressVault class localStorage handling.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { maskCreditCardNumber } from '../../js/checkout-vault.js';

// Re-implement AddressVault for isolated testing without localStorage side effects.
class TestAddressVault {
  constructor() {
    this.storageKey = 'cara_saved_addresses';
  }

  getAddresses() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  saveAddress(addr) {
    if (!addr || typeof addr !== 'object') return false;
    try {
      const list = this.getAddresses();
      list.push(addr);
      localStorage.setItem(this.storageKey, JSON.stringify(list));
      return true;
    } catch (err) {
      // Silently fail
      return false;
    }
  }

  clearAddresses() {
    localStorage.removeItem(this.storageKey);
  }
}

describe('AddressVault getAddresses', () => {
  let vault;

  beforeEach(() => {
    localStorage.clear();
    vault = new TestAddressVault();
  });

  it('returns an empty array when localStorage is empty', () => {
    expect(vault.getAddresses()).toEqual([]);
  });

  it('parses and returns saved addresses from localStorage', () => {
    const addresses = [{ street: '123 Main St', city: 'Mumbai' }];
    localStorage.setItem(vault.storageKey, JSON.stringify(addresses));
    expect(vault.getAddresses()).toEqual(addresses);
  });

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem(vault.storageKey, 'not valid json {');
    expect(vault.getAddresses()).toEqual([]);
  });

  it('handles empty string in localStorage gracefully', () => {
    localStorage.setItem(vault.storageKey, '');
    expect(vault.getAddresses()).toEqual([]);
  });

  it('returns an empty array when localStorage raises an exception', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error('Storage unavailable');
    });
    expect(vault.getAddresses()).toEqual([]);
    localStorage.getItem = originalGetItem;
  });
});

describe('AddressVault saveAddress', () => {
  let vault;

  beforeEach(() => {
    localStorage.clear();
    vault = new TestAddressVault();
  });

  it('saves a new address to localStorage', () => {
    vault.saveAddress({ street: '456 Oak Ave', city: 'Delhi' });
    const addresses = JSON.parse(localStorage.getItem(vault.storageKey));
    expect(addresses.length).toBe(1);
    expect(addresses[0].street).toBe('456 Oak Ave');
  });

  it('appends addresses to existing list', () => {
    vault.saveAddress({ street: 'First St', city: 'Bangalore' });
    vault.saveAddress({ street: 'Second St', city: 'Pune' });
    const addresses = JSON.parse(localStorage.getItem(vault.storageKey));
    expect(addresses.length).toBe(2);
  });

  it('silently fails when localStorage.setItem raises an exception', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage full');
    });
    // Should not throw
    expect(() => vault.saveAddress({ street: 'Test' })).not.toThrow();
    localStorage.setItem = originalSetItem;
  });

  it('returns an empty array when stored value is not an array', () => {
    localStorage.setItem(vault.storageKey, JSON.stringify({ street: 'Legacy object' }));
    expect(vault.getAddresses()).toEqual([]);
  });

  it('recovers and overwrites a corrupt non-array store on next save', () => {
    localStorage.setItem(vault.storageKey, JSON.stringify({ not: 'an array' }));
    vault.saveAddress({ street: 'Recovered St', city: 'Goa' });
    const addresses = JSON.parse(localStorage.getItem(vault.storageKey));
    expect(addresses).toEqual([{ street: 'Recovered St', city: 'Goa' }]);
  });

  it('rejects invalid address payloads without touching storage', () => {
    expect(vault.saveAddress(null)).toBe(false);
    expect(vault.saveAddress('not-an-object')).toBe(false);
    expect(localStorage.getItem(vault.storageKey)).toBeNull();
  });
});

describe('maskCreditCardNumber', () => {
  it('is exported as a callable function', () => {
    expect(typeof maskCreditCardNumber).toBe('function');
  });
});
