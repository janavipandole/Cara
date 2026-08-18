/**
 * Prototype Pollution Guard
 * Provides utilities to prevent prototype pollution attacks when merging,
 * cloning, or assigning properties from untrusted or user-controlled sources.
 *
 * Attack vector: An attacker injects "__proto__", "constructor", or "prototype"
 * keys into JSON payloads or URL parameters. If these keys are used to assign
 * properties on objects, the attacker can modify Object.prototype globally,
 * leading to XSS, auth bypass, or full application compromise.
 */

const DANGEROUS_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

/**
 * Returns true if the given key is safe to use in property assignment.
 * Blocks keys that could modify the prototype chain.
 * @param {string|symbol} key
 * @returns {boolean}
 */
export function isSafeKey(key) {
  if (typeof key === 'symbol') return true;
  return !DANGEROUS_KEYS.has(key);
}

/**
 * Creates an object with a null prototype, eliminating the attack surface
 * entirely for user-controlled dictionaries.
 * @param {Object} [source] - Optional source to copy own enumerable properties from.
 * @returns {Object}
 */
export function createNullPrototypeObject(source) {
  const obj = Object.create(null);
  if (source && typeof source === 'object') {
    for (const key of Object.keys(source)) {
      if (isSafeKey(key)) {
        obj[key] = source[key];
      }
    }
  }
  return obj;
}

/**
 * Assigns a value to target[key] only if the key is safe.
 * @param {Object} target
 * @param {string} key
 * @param {*} value
 * @returns {boolean} true if assignment was performed, false if blocked.
 */
export function safeAssign(target, key, value) {
  if (!isSafeKey(key)) return false;
  target[key] = value;
  return true;
}

/**
 * Performs a shallow merge of source properties into target, skipping
 * any keys that could pollute the prototype chain.
 * @param {Object} target
 * @param {Object} source
 * @returns {Object} target (mutated)
 */
export function safeMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(source)) {
    if (isSafeKey(key)) {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * Strips dangerous keys from an already-parsed object (e.g. from JSON.parse).
 * Useful when consuming data from localStorage or API responses.
 * Operates shallowly on the top-level keys.
 * @param {Object} obj
 * @returns {Object} the same object reference, with dangerous keys removed.
 */
export function sanitizeObjectKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (!isSafeKey(key)) {
      delete obj[key];
    }
  }
  return obj;
}
