// Accessibility (a11y) validation checking for WCAG 2.1 AA Standards compliance
(function (root) {
  'use strict';

  function runA11yAudit() {
    if (typeof document === 'undefined') return;

    var errors = [];
    var warnings = [];

    // 1. Check images for alt attributes
    var images = document.querySelectorAll('img');
    images.forEach(function (img, i) {
      if (!img.hasAttribute('alt')) {
        errors.push({
          element: img,
          message: 'Image ' + (img.src ? '"' + img.src + '"' : '#' + i) + ' is missing an alt attribute.'
        });
      }
    });

    // 2. Check buttons for accessible text
    var buttons = document.querySelectorAll('button');
    buttons.forEach(function (btn, i) {
      var hasText = !!btn.textContent.trim();
      var hasAriaLabel = btn.hasAttribute('aria-label') && !!btn.getAttribute('aria-label').trim();
      var hasAriaLabelledby = btn.hasAttribute('aria-labelledby');

      if (!hasText && !hasAriaLabel && !hasAriaLabelledby) {
        errors.push({
          element: btn,
          message: 'Button ' + (btn.id ? '"#' + btn.id + '"' : '#' + i) + ' has no accessible name.'
        });
      }
    });

    // 3. Check inputs for associated labels
    var inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(function (input, i) {
      // Skip hidden inputs
      if (input.type === 'hidden') return;

      var id = input.id;
      var hasLabel = false;

      if (id) {
        var label = document.querySelector('label[for="' + id + '"]');
        if (label && label.textContent.trim()) {
          hasLabel = true;
        }
      }

      // Check if wrapped inside a label
      if (!hasLabel) {
        var parent = input.parentElement;
        while (parent) {
          if (parent.tagName === 'LABEL') {
            hasLabel = true;
            break;
          }
          parent = parent.parentElement;
        }
      }

      var hasAriaLabel = input.hasAttribute('aria-label') && !!input.getAttribute('aria-label').trim();
      var hasAriaLabelledby = input.hasAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
        warnings.push({
          element: input,
          message: 'Input ' + (input.name ? '"' + input.name + '"' : '#' + i) + ' has no associated label or aria-label.'
        });
      }
    });

    // Output audit results
    if (errors.length > 0 || warnings.length > 0) {
      console.groupCollapsed('♿ WCAG 2.1 Compliance Audit Results');
      if (errors.length > 0) {
        console.error('Errors (' + errors.length + '):');
        errors.forEach(function (err) {
          console.error(err.message, err.element);
        });
      }
      if (warnings.length > 0) {
        console.warn('Warnings (' + warnings.length + '):');
        warnings.forEach(function (warn) {
          console.warn(warn.message, warn.element);
        });
      }
      console.groupEnd();
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runA11yAudit);
    } else {
      runA11yAudit();
    }
  }

  root.runA11yAudit = runA11yAudit;
})(typeof window !== 'undefined' ? window : globalThis);
