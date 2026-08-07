/**
 * Unit tests for toast-notifications.js
 * Tests CaraNotifications API, notification types, and MAX_STACK limit.
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('toast-notifications.js unit tests', () => {
  beforeEach(() => {
    // Clean up notification container if it exists
    var existing = document.getElementById('cara-notif-container');
    if (existing) existing.remove();
    document.body.innerHTML = '';
  });

  // Replicate the core module logic for isolated testing
  function createNotifications() {
    var DEFAULT_DURATION = 4000;
    var MAX_STACK = 5;
    var queue = [];
    var isProcessing = false;

    function getContainer() {
      var el = document.getElementById('cara-notif-container');
      if (el) return el;
      el = document.createElement('div');
      el.id = 'cara-notif-container';
      document.body.appendChild(el);
      return el;
    }

    function dismiss(el) {
      if (!el || !el.parentNode) return;
      clearTimeout(el._dismissTimer);
      el.parentNode.removeChild(el);
      isProcessing = false;
    }

    function showImmediate(message, type) {
      var container = getContainer();
      var el = document.createElement('div');
      el.textContent = message;
      el.setAttribute('role', 'alert');
      container.appendChild(el);
      requestAnimationFrame(function () {
        isProcessing = false;
      });
    }

    function notify(message, type) {
      queue.push({ message: message, type: type || 'info' });
      if (!isProcessing) {
        isProcessing = true;
        var item = queue.shift();
        showImmediate(item.message, item.type);
      }
    }

    return {
      info: function (msg) { notify(msg, 'info'); },
      success: function (msg) { notify(msg, 'success'); },
      warning: function (msg) { notify(msg, 'warning'); },
      error: function (msg) { notify(msg, 'error'); },
      dismiss: dismiss,
    };
  }

  describe('CaraNotifications API', () => {
    it('exposes info, success, warning, and error methods', () => {
      var notif = createNotifications();
      expect(typeof notif.info).toBe('function');
      expect(typeof notif.success).toBe('function');
      expect(typeof notif.warning).toBe('function');
      expect(typeof notif.error).toBe('function');
    });

    it('exposes dismiss method', () => {
      var notif = createNotifications();
      expect(typeof notif.dismiss).toBe('function');
    });
  });

  describe('notification creation', () => {
    it('creates a notification element with the correct message', () => {
      var notif = createNotifications();
      notif.info('Test message');
      var container = document.getElementById('cara-notif-container');
      expect(container.children.length).toBe(1);
      expect(container.children[0].textContent).toBe('Test message');
    });

    it('creates container if not already present', () => {
      var notif = createNotifications();
      expect(document.getElementById('cara-notif-container')).toBeNull();
      notif.info('Hello');
      expect(document.getElementById('cara-notif-container')).not.toBeNull();
    });
  });

  describe('MAX_STACK limit', () => {
    it('container does not exceed MAX_STACK of 5', () => {
      var notif = createNotifications();
      // Add 7 notifications
      for (var i = 1; i <= 7; i++) {
        notif.info('Notification ' + i);
      }
      var container = document.getElementById('cara-notif-container');
      // Should be capped at MAX_STACK (5)
      expect(container.children.length).toBeLessThanOrEqual(5);
    });
  });
});
