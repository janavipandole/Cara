import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('simple-captcha', () => {
  let input;
  let feedback;

  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = `
      <form id="login">
        <button type="submit">Login</button>
      </form>
    `;
  });

  it('injects the captcha and blocks a wrong answer on submit', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    await import('../../js/simple-captcha.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    input = document.getElementById('captcha-input');
    feedback = document.getElementById('captcha-feedback');
    expect(input).toBeTruthy();
    expect(document.getElementById('captcha-math-label')).toBeTruthy();

    input.value = '99999';
    const form = document.getElementById('login');
    const event = new Event('submit', { cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(feedback.textContent).toContain('Incorrect captcha');
  });

  it('clears the captcha input via the reset button', async () => {
    await import('../../js/simple-captcha.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    input = document.getElementById('captcha-input');
    input.value = '42';
    const resetBtn = document.getElementById('captcha-reset-btn');
    expect(resetBtn).toBeTruthy();
    resetBtn.click();
    expect(input.value).toBe('');
  });

  it('renders a valid math expression in the captcha label', async () => {
    await import('../../js/simple-captcha.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));

    const label = document.getElementById('captcha-math-label');
    expect(label.textContent).toContain('Verify You Are Human');
    const match = label.textContent.match(/(\d+)\s*\+\s*(\d+)\s*=\s*\?/);
    expect(match).not.toBeNull();
    const num1 = parseInt(match[1], 10);
    const num2 = parseInt(match[2], 10);
    expect(num1).toBeGreaterThanOrEqual(1);
    expect(num2).toBeGreaterThanOrEqual(1);
    expect(num1).toBeLessThanOrEqual(10);
    expect(num2).toBeLessThanOrEqual(10);
  });
});
