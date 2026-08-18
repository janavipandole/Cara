import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isSafeKey,
  createNullPrototypeObject,
  safeAssign,
  safeMerge,
  sanitizeObjectKeys,
} from '../../js/prototype-pollution-guard.js';

describe('Prototype Pollution Guard', () => {
  describe('isSafeKey', () => {
    it('allows normal string keys', () => {
      expect(isSafeKey('name')).toBe(true);
      expect(isSafeKey('count')).toBe(true);
      expect(isSafeKey('')).toBe(true);
      expect(isSafeKey('toString')).toBe(true);
    });

    it('blocks __proto__', () => {
      expect(isSafeKey('__proto__')).toBe(false);
    });

    it('blocks constructor', () => {
      expect(isSafeKey('constructor')).toBe(false);
    });

    it('blocks prototype', () => {
      expect(isSafeKey('prototype')).toBe(false);
    });

    it('allows symbol keys', () => {
      const sym = Symbol('test');
      expect(isSafeKey(sym)).toBe(true);
    });
  });

  describe('createNullPrototypeObject', () => {
    it('creates an object with null prototype', () => {
      const obj = createNullPrototypeObject();
      expect(Object.getPrototypeOf(obj)).toBeNull();
    });

    it('copies safe keys from source', () => {
      const source = { a: 1, b: 2, c: 3 };
      const obj = createNullPrototypeObject(source);
      expect(obj.a).toBe(1);
      expect(obj.b).toBe(2);
      expect(obj.c).toBe(3);
    });

    it('strips dangerous keys from source', () => {
      const source = { safe: 1, __proto__: { polluted: true }, constructor: 'bad', prototype: 'bad' };
      const obj = createNullPrototypeObject(source);
      expect(obj.safe).toBe(1);
      expect('__proto__' in obj).toBe(false);
      expect('constructor' in obj).toBe(false);
      expect('prototype' in obj).toBe(false);
    });

    it('does not pollute Object.prototype', () => {
      const before = Object.prototype.pollutionTest;
      const source = { __proto__: { pollutionTest: 'POLLUTED' } };
      createNullPrototypeObject(source);
      expect(Object.prototype.pollutionTest).toBe(before);
    });
  });

  describe('safeAssign', () => {
    it('assigns safe keys normally', () => {
      const obj = {};
      const result = safeAssign(obj, 'name', 'Alice');
      expect(result).toBe(true);
      expect(obj.name).toBe('Alice');
    });

    it('blocks __proto__ assignment', () => {
      const obj = {};
      const result = safeAssign(obj, '__proto__', { polluted: true });
      expect(result).toBe(false);
      expect(obj.__proto__).not.toEqual({ polluted: true });
    });

    it('blocks constructor assignment', () => {
      const obj = {};
      const result = safeAssign(obj, 'constructor', 'bad');
      expect(result).toBe(false);
    });

    it('blocks prototype assignment', () => {
      const obj = {};
      const result = safeAssign(obj, 'prototype', 'bad');
      expect(result).toBe(false);
    });

    it('does not pollute Object.prototype', () => {
      const before = { ...Object.prototype };
      safeAssign({}, '__proto__', { hacked: true });
      expect(Object.prototype.hacked).toBeUndefined();
    });
  });

  describe('safeMerge', () => {
    it('merges safe properties', () => {
      const target = { a: 1 };
      safeMerge(target, { b: 2, c: 3 });
      expect(target).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('skips dangerous keys during merge', () => {
      const target = { safe: 1 };
      safeMerge(target, { __proto__: { polluted: true }, safe: 2, constructor: 'bad' });
      expect(target.safe).toBe(2);
      expect(target.__proto__).not.toEqual({ polluted: true });
    });

    it('handles null/undefined source gracefully', () => {
      const target = { a: 1 };
      safeMerge(target, null);
      expect(target).toEqual({ a: 1 });
      safeMerge(target, undefined);
      expect(target).toEqual({ a: 1 });
    });

    it('returns the target object', () => {
      const target = {};
      const result = safeMerge(target, { a: 1 });
      expect(result).toBe(target);
    });

    it('does not pollute Object.prototype', () => {
      safeMerge({}, { __proto__: { hacked: true } });
      expect(Object.prototype.hacked).toBeUndefined();
    });
  });

  describe('sanitizeObjectKeys', () => {
    it('removes dangerous keys from an object', () => {
      const obj = { a: 1, __proto__: { polluted: true }, constructor: 'bad', prototype: 'bad', b: 2 };
      sanitizeObjectKeys(obj);
      expect(obj.a).toBe(1);
      expect(obj.b).toBe(2);
      expect(Object.prototype.hasOwnProperty.call(obj, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(obj, 'constructor')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(obj, 'prototype')).toBe(false);
    });

    it('returns non-object inputs unchanged', () => {
      expect(sanitizeObjectKeys(null)).toBe(null);
      expect(sanitizeObjectKeys(undefined)).toBe(undefined);
      expect(sanitizeObjectKeys(42)).toBe(42);
      expect(sanitizeObjectKeys('str')).toBe('str');
    });

    it('returns the same object reference', () => {
      const obj = { a: 1 };
      const result = sanitizeObjectKeys(obj);
      expect(result).toBe(obj);
    });

    it('does not pollute Object.prototype', () => {
      const obj = { __proto__: { hacked: true } };
      sanitizeObjectKeys(obj);
      expect(Object.prototype.hacked).toBeUndefined();
    });
  });

  describe('integration: Store proxy set trap', () => {
    it('blocks __proto__ assignment through proxy', () => {
      const state = {};
      const blocked = [];
      const proxy = new Proxy(state, {
        set(target, property, value) {
          if (!isSafeKey(property)) {
            blocked.push(property);
            return false;
          }
          target[property] = value;
          return true;
        }
      });

      expect(() => { proxy.__proto__ = { hacked: true }; }).toThrow();
      expect(blocked).toContain('__proto__');
    });

    it('allows safe property assignment through proxy', () => {
      const state = {};
      const proxy = new Proxy(state, {
        set(target, property, value) {
          if (!isSafeKey(property)) return false;
          target[property] = value;
          return true;
        }
      });

      proxy.theme = 'dark';
      expect(state.theme).toBe('dark');
    });
  });

  describe('integration: localStorage JSON.parse + sanitize', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('strips __proto__ from parsed localStorage data', () => {
      const malicious = JSON.stringify({
        theme: 'dark',
        __proto__: { polluted: true },
        constructor: 'bad',
      });
      localStorage.setItem('test_pollution', malicious);

      const parsed = JSON.parse(localStorage.getItem('test_pollution'));
      sanitizeObjectKeys(parsed);

      expect(parsed.theme).toBe('dark');
      expect(Object.prototype.hasOwnProperty.call(parsed, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(parsed, 'constructor')).toBe(false);
    });

    it('does not pollute Object.prototype after parsing', () => {
      const malicious = JSON.stringify({ __proto__: { hacked: true } });
      localStorage.setItem('test_pollution2', malicious);

      const parsed = JSON.parse(localStorage.getItem('test_pollution2'));
      sanitizeObjectKeys(parsed);

      expect(Object.prototype.hacked).toBeUndefined();
    });
  });
});
